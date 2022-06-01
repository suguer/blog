---
title: "Other"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

[powerdns安装教程](/blog/other/powerdns)

### 如何使用powerdns的http-api ?
1. 文档需知
[powerdns文档](https://doc.powerdns.com/authoritative/http-api/index.html#working-with-the-api)    
Swagger接入开发 [powerdns的yaml配置文件](https://raw.githubusercontent.com/PowerDNS/pdns/master/docs/http-api/swagger/authoritative-api-swagger.yaml) | [swagger官网](https://swagger.io/tools/swaggerhub/enterprise/)

2.  Swagger 生成插件  
    Sign in 登录 (没有账号的免费注册一个)  
    Create New -> Create New API   
    创建完毕将powerdns的yaml配置文件粘贴到代码框中  
    右上角 -> Export -> Client SDK -> 指定的开发语言,像我就用PHP
    github创建一个新的 repository , 将导出来的文件上传上去
    修改composer.json
    ```json
    {
        "repositories": [
            {
                "type": "git",
                "url": "https://github.com/suguer/powerdns.git"
            }
        ],
        "require": {
            "suguer/powerdns": "*@dev"
        }
    }
    ```
    
    
3. 开始使用 DnsPowerDnsClient.php
```php

use Swagger\Client\Api\ZonesApi;
use Swagger\Client\ApiException;
use Swagger\Client\Model\RRSet;
use Swagger\Client\Model\Zone;
use Swagger\Client\Configuration;

class DnsPowerDnsClient {

        private $server_id = "localhost";

       /**
         * @var \GuzzleHttp\Client
         */
        private $client;
        
         /**
         * @var ZonesApi
         */
       private $zoneApi;
        
       private $currentNsList = ['ns1','ns2'];
        
       public function __construct()
        {
            $config=[
                "ip" => "",
                "api_key" => "",
           ];
           $this->client = new \GuzzleHttp\Client([
                       'timeout' => 40.0,
                   ]);
           $this->config = Configuration::getDefaultConfiguration()
                ->setHost("http://{$config['ip']}:8081/api/v1")
                ->setApiKey('X-API-Key', $config['api_key']);
           $this->zoneApi = new ZonesApi($this->client, $this->config);
        }
        
        
    public function AddDomain($domain)
    {
        try {
            $nameservers = [];
            foreach ($this->currentNsList as $value) {
                $nameservers[] = "{$value}.";
            }
            $zone = new Zone([
                'name' => $domain['domain'] . ".",
                'type' => 'Zone',
                'kind' => 'Master',
                'nameservers' => $nameservers,
            ]);
            $this->zoneApi->createZoneWithHttpInfo($this->server_id, $zone, "false");
            return true;
        } catch (ApiException $e) {
            $error = json_decode($e->getResponseBody(), 1);
            if (isset($error['error']) && $error['error'] == "Conflict") return true;
            return $error['error'];
        }
    }
    
    public function DeleteDomain($domain)
    {
        try {
            $this->zoneApi->deleteZone($this->server_id, $domain['domain']);
            return true;
        } catch (ApiException $e) {
            $error = json_decode($e->getResponseBody(), 1);
            if (isset($error['error']) && $error['error'] == "Conflict") return true;
            return $error['error'];
        }
    }
    
    
      public function AddDomainRecord($record, $domain = null)
        {
            try {
                $domain = $record['domain'];
                if (in_array($record['type'], ['REDIRECT_URL', 'FORWARD_URL'])) {
                    //还需要先判断是否有相同主机头的A记录,因为也会冲突
                    $exist_record = Record::where("host", $record['host'])
                        ->where('platform', $record['platform'])
                        ->where('domain', $record['domain'])
                        ->whereIn('type', ["A", "CNAME", 'REDIRECT_URL', 'FORWARD_URL'])
                        ->whereNotNull('record_id')
                        ->where('id', '<>', $record['id'])
                        ->first();
                    if ($exist_record) {
                        return "type-already-exists";
                    }
    
                    $functions = $record['type'] == "REDIRECT_URL" ? 1 : 2;
                    $UrlForwardBaseResp =
                        UrlForwardBase::createForwardAPI($this->FormatRRsetName($record) . "{$domain}",
                            $functions,
                            $record['value']);
                    if ($UrlForwardBaseResp !== 1) {
                        return $UrlForwardBaseResp;
                    }
                }
                $total_repeat_record = Record::where("host", $record['host'])
                    ->where('platform', $record['platform'])
                    ->where('domain', $record['domain'])
                    ->where('type', $record['type'])
                    ->whereNotNull('record_id')
                    ->where('id', '<>', $record['id'])
                    ->get();
                $rrset = new RRSet([
                    "name" => $this->FormatRRsetName($record) . "{$domain}.",
                    "type" => $this->FormatRRsetType($record),
                    "ttl" => $record['ttl'],
                    "changetype" => "REPLACE",
                ]);
                $rrset_record_list = [new \Swagger\Client\Model\Record([
                    "content" => $this->FormatRRsetContent($record),
                    "disabled" => $record['state'] == 2 ? true : false,
                ])];
                if (count($total_repeat_record) > 0) {
                    foreach ($total_repeat_record as $repeat_record) {
                        $rrset_record_list[] =
                            new \Swagger\Client\Model\Record([
                                "content" => $this->FormatRRsetContent($repeat_record),
                                "disabled" => $repeat_record['state'] == 2 ? true : false,
                            ]);
                    }
                }
                $rrset->setRecords($rrset_record_list);
                $zone = new Zone([
                    'id' => $domain,
                    'name' => $domain,
                    'rrsets' => [$rrset]
                ]);
                $this->zoneApi->patchZoneWithHttpInfo($this->server_id, $domain, $zone);
                return true;
            } catch (ApiException $e) {
                $error = json_decode($e->getResponseBody(), 1);
                return $error['error'];
            }
        }
        
          public function DeleteDomainRecord($record, $param = [])
            {
                try {
                    $domain = $record['domain'];
                    if (in_array($record['type'], ['REDIRECT_URL', 'FORWARD_URL'])) {
                        $UrlForwardBaseResp =
                            UrlForwardBase::deleteForwardAPI($this->FormatRRsetName($record) . "{$domain}");
                        if ($UrlForwardBaseResp !== 1) {
                            return $UrlForwardBaseResp;
                        }
                    }
                    $total_repeat_record = Record::where("host", $record['host'])
                        ->where('platform', $record['platform'])
                        ->where('domain', $record['domain'])
                        ->where('type', $record['type'])
                        ->whereNotNull('record_id')
                        ->where('id', '<>', $record['id'])
                        ->get();
                    if (count($total_repeat_record) > 0) {
                        $rrset = null;
                        $rrset_record_list = [];
                        foreach ($total_repeat_record as $repeat_record) {
                            if (!$rrset) {
                                $rrset = new RRSet([
                                    "name" => $this->FormatRRsetName($repeat_record) . "{$repeat_record['domain']}.",
                                    "type" => $this->FormatRRsetType($repeat_record),
                                    "ttl" => $repeat_record['ttl'],
                                    "changetype" => "REPLACE",
                                ]);
                            }
                            $rrset_record_list[] = new \Swagger\Client\Model\Record([
                                "content" => $this->FormatRRsetContent($repeat_record),
                                "disabled" => false,
                            ]);
                        }
                        $rrset->setRecords($rrset_record_list);
                    } else {
                        $rrset = new RRSet([
                            "name" => $this->FormatRRsetName($record) . "{$domain}.",
                            "type" => $this->FormatRRsetType($record),
                            "ttl" => $record['ttl'],
                            "changetype" => "DELETE",
                        ]);
                    }
                    $zone = new Zone([
                        'id' => $domain,
                        'name' => $domain,
                        'rrsets' => [$rrset]
                    ]);
                    $this->zoneApi->patchZoneWithHttpInfo($this->server_id, $domain, $zone);
                    return true;
                } catch (ApiException $e) {
                    $error = json_decode($e->getResponseBody(), 1);
                    return $error['error'];
                }
            }


    public function UpdateDomainRecord($record, $domain = null)
    {
        try {
            $old_record = Record::where('id', $record['id'])->first();
            $domain = $record['domain'];
            if (in_array($record['type'], ['REDIRECT_URL', 'FORWARD_URL'])) {
                //还需要先判断是否有相同主机头的A记录,因为也会冲突
                $exist_record = Record::where("host", $record['host'])
                    ->where('platform', $record['platform'])
                    ->where('domain', $record['domain'])
                    ->whereIn('type', ["A", "CNAME", 'REDIRECT_URL', 'FORWARD_URL'])
                    ->whereNotNull('record_id')
                    ->where('id', '<>', $record['id'])
                    ->first();
                if ($exist_record) {
                    return "type-already-exists";
                }
                $functions = $record['type'] == "REDIRECT_URL" ? 1 : 2;

                if ($this->FormatRRsetName($old_record) == $this->FormatRRsetName($record)) {
                    $UrlForwardBaseResp =
                        UrlForwardBase::updateForwardAPI($this->FormatRRsetName($record) . "{$domain}",
                            $functions,
                            $record['value']);
                    if ($UrlForwardBaseResp !== 1) {
                        return $UrlForwardBaseResp;
                    }
                } else {
                    $UrlForwardBaseResp =
                        UrlForwardBase::deleteForwardAPI($this->FormatRRsetName($old_record) . "{$domain}");
                    if ($UrlForwardBaseResp !== 1) {
                        return $UrlForwardBaseResp;
                    }

                    $UrlForwardBaseResp =
                        UrlForwardBase::createForwardAPI($this->FormatRRsetName($record) . "{$domain}",
                            $functions,
                            $record['value']);
                    if ($UrlForwardBaseResp !== 1) {
                        return $UrlForwardBaseResp;
                    }
                }
            }
            $total_repeat_record = Record::where("host", $record['host'])
                ->where('platform', $record['platform'])
                ->where('domain', $record['domain'])
                ->where('type', $record['type'])
                ->whereNotNull('record_id')
                ->where('id', '<>', $record['id'])
                ->get();
            $rrset = new RRSet([
                "name" => $this->FormatRRsetName($record) . "{$domain}.",
                "type" => $this->FormatRRsetType($record),
                "ttl" => $record['ttl'],
                "changetype" => "REPLACE",
            ]);
            $rrset_record_list = [new \Swagger\Client\Model\Record([
                "content" => $this->FormatRRsetContent($record),
                "disabled" => $record['state'] == 2 ? true : false,
            ])];
            if (count($total_repeat_record) > 0) {
                foreach ($total_repeat_record as $repeat_record) {
                    $rrset_record_list[] =
                        new \Swagger\Client\Model\Record([
                            "content" => $this->FormatRRsetContent($repeat_record),
                            "disabled" => $repeat_record['state'] == 2 ? true : false,
                        ]);
                }
            }
            $rrset->setRecords($rrset_record_list);
            $rrsets = [$rrset];
            if ($old_record['host'] != $record['host'] || $old_record['type'] != $record['type']) {
                $rrset_record_list = [];
                //和旧记录的解析头不同,还需要吧历史的清除一下
                $total_repeat_record = Record::where("host", $old_record['host'])
                    ->where('platform', $record['platform'])
                    ->where('domain', $record['domain'])
                    ->where('type', $record['type'])
                    ->whereNotNull('record_id')
                    ->where('id', '<>', $record['id'])
                    ->get();
                $rrset = new RRSet([
                    "name" => $this->FormatRRsetName($old_record) . "{$domain}.",
                    "type" => $this->FormatRRsetType($old_record),
                    "ttl" => $record['ttl'],
                ]);
                if (count($total_repeat_record) == 0) {
                    $rrset->setChangetype("DELETE");
                } else {
                    $rrset->setChangetype("REPLACE");
                    if (count($total_repeat_record) > 0) {
                        foreach ($total_repeat_record as $repeat_record) {
                            $rrset_record_list[] =
                                new \Swagger\Client\Model\Record([
                                    "content" => $this->FormatRRsetContent($repeat_record),
                                    "disabled" => false,
                                ]);
                        }
                        $rrset->setRecords($rrset_record_list);
                    }
                }
                array_unshift($rrsets, $rrset);
            }
            $zone = new Zone([
                'id' => $domain,
                'name' => $domain,
                'rrsets' => $rrsets
            ]);
            $this->zoneApi->patchZoneWithHttpInfo($this->server_id, $domain, $zone);
            return true;
        } catch (ApiException $e) {
            $error = json_decode($e->getResponseBody(), 1);
            return $error['error'];
        }
    }



    /**
     * 获取解析记录列表
     * @param $DomainName
     * @param array $param
     * @return array
     */
    public function DescribeDomainRecords($DomainName, $param = [])
    {
        try {
            $result = $this->zoneApi->listZone($this->server_id, $DomainName);
            $list = [];
            foreach ($result['rrsets'] as $key => $rrset) {
                if ($rrset['type'] == "SOA") continue;
                $host = str_replace("{$DomainName}.", "", $rrset['name']);
                $mx = "";
                foreach ($rrset['records'] as $rrset_record) {
                    $value = trim($rrset_record['content'], ".");
                    if ($rrset['type'] == "MX") {
                        $tmp = explode(" ", $value);
                        $mx = trim($tmp[0]);
                        $value = trim($tmp[1]);
                    }elseif ($rrset['type'] == "TXT") {
                        $value = trim($value,"\"");
                    }
                    if ($rrset['type'] == "NS" && in_array($value, self::$NSList)) continue;
                    $list[] = [
                        'DomainName' => $DomainName,
                        'RecordId' => $key + 1,
                        'RR' => trim($host, "."),
                        'Type' => $rrset['type'],
                        'MX' => $mx,
                        'Value' => $value,
                        'Line' => "",
                        'Priority' => "",
                        'TTL' => $rrset['ttl'],
                        'Status' => $rrset_record["disabled"] ? 2 : 0,
                        'Locked' => '0',
                    ];
                }
            }
            return $list;
        } catch (ApiException $e) {
            $error = json_decode($e->getResponseBody(), 1);
            return $error['error'];
        }


    }
    
    
    private function FormatRRsetName($record)
    {
        $name = "";
        if ($record['host'] == "@") {
            $name = "";
        } elseif ($record['host']) {
            $name = "{$record['host']}.";
        }
        return "{$name}";
    }

    private function FormatRRsetType($record)
    {
        if (in_array($record['type'], ['REDIRECT_URL', 'FORWARD_URL'])) {
            return "A";
        }
        return $record['type'];
    }

    private function FormatRRsetContent($record, $defaultContent = "")
    {
        $content = $record['value'];
        switch ($record['type']) {
            case "MX":
                $content = "{$record['mx']} {$record['value']}.";
                break;
            case "TXT":
                $content = "\"{$content}\"";
                break;
            case "CNAME":
            case "NS":
            case "SRV":
                $content = "{$record['value']}.";
                break;
            case "REDIRECT_URL": // 显性URL转发
            case "FORWARD_URL": //隐性URL转发
//                $content = UrlForwardBase::getFastDomain().".";
                $content = gethostbyname(UrlForwardBase::getFastDomain());
                //先请求添加转发服务器,添加成功往下走,否则失败
                break;
            default:
                break;
        }
        return $content;
    }

    /**
     * 更新解析状态
     * @param $record
     * @param $status
     * @param array $param
     * @return mixed
     */
    public function SetDomainRecordStatus($record, $status, $param = [])
    {
        $record->state = $status == 'Disable' ? 2 : 0;
        return $this->UpdateDomainRecord($record);
    }
}
```    

 
4.数据库表结构
```php

CREATE TABLE `domains`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL,
  `remote_id` varchar(36) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp(0) NULL,
  `updated_at` timestamp(0) NULL,
  `deleted_at` timestamp(0) NULL DEFAULT NULL,
  `platform` varchar(16) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT 'dnscom',
  `dns` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT '',
  `status` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_unicode_ci ROW_FORMAT = Dynamic;


CREATE TABLE `records`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL,
  `record_id` bigint(32) NULL DEFAULT NULL,
  `host` varchar(256) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL,
  `state` int(11) NULL DEFAULT 0,
  `type` varchar(32) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL,
  `value` varchar(256) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL,
  `ttl` int(11) NULL DEFAULT 0,
  `mx` int(11) NULL DEFAULT 0,
  `url_type` int(11) NULL DEFAULT 0,
  `remark` varchar(32) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp(0) NULL DEFAULT NULL,
  `updated_at` timestamp(0) NULL DEFAULT NULL,
  `deleted_at` timestamp(0) NULL DEFAULT NULL,
  `platform` varchar(16) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT 'dnscom',
  `dns` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_unicode_ci ROW_FORMAT = Dynamic;


```
