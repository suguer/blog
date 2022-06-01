---
title: "BaotaVhost"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

利用 [宝塔](http://www.bt.cn) 封装的虚拟主机类,自用的服务器,以宝塔软件辅助为主搭建的  
/data/vhost/baota.conf.json
```json
[
  {
      "fchrServer":"flage",
      "host":"127.0.0.1",
      "key":"bt_api_key",
      "port":"8888",
      "mysql":"mysql_password",
      "sqlserver":"mssql_password",
      "region_id":"hk",
      "zone_id":"hk-02",
      "network":"bgp"
  }
]
```
VhostBaotaClient.php
```php
class VhostBaotaClient implements VhostClientInterface
{
    use ApiConfigTrait;
    use ApiLoggerTrait;
    private $client;


    private $key = "";
    public $host = "";
    private $port = "8888";
    private $mssql_password = "";

    /**
     * @var array  远端主机的状态转换
     */
    public $RemoteStatus = [
        '1' => 'Running',
        '0' => 'Stopped',
    ];
    public $IISRemoteStatus = [
        'Started' => 'Running',
        'Stopped' => 'Stopped',
    ];


    public static function getConfig()
    {
        return json_decode(file_get_contents('/data/vhost/baota.conf.json'), 1);
    }


    public function __construct($chrFTPServer = "")
    {
        if ($chrFTPServer) {
            $config = self::getConfig();
            preg_match("([\d]+)", $chrFTPServer, $matches);
            foreach ($config as $value) {
                if ($value['fchrServer'] == $matches[0]) {
                    $this->key = $value['key'];
                    $this->host = $value['host'];
                    $this->port = $value['port'];
                    $this->mssql_password = $value['sqlserver'];
                    break;
                }
            }

        }
        $this->initLogger(-3, 2);
        $this->client = new GuzzleHttp\Client([
            'timeout' => 300.0,
        ]);
    }

    public function SetChrFTPServer($chrFTPServer = "")
    {
        if ($chrFTPServer) {
            $config = self::getConfig();
            preg_match("([\d]+)", $chrFTPServer, $matches);
            foreach ($config as $value) {
                if ($value['fchrServer'] == $matches[0]) {
                    $this->key = $value['key'];
                    $this->host = $value['host'];
                    $this->port = $value['port'];
                    $this->mssql_password = $value['sqlserver'];
                    break;
                }
            }
        }
    }

    /**
     * 获取vhost实例远程信息
     * @param array $ids 主参数，实例列表数组
     * @param array $params 其它参数
     * @return mixed
     */
    public function describeInstances($ids = [], $params = [])
    {
        $action = '/data?action=getData';
        $p = [
            'table' => 'sites',
            'type' => -1,
            'limit' => 20,
            'p' => 1,
            'search' => $ids[0]
        ];
        return $this->request($action, $p);
    }

    public function describePrice($vhost, $Period, $PeriodUnit)
    {
        // TODO: Implement describePrice() method.
    }

    public function describeRenewPrice($vhost, $Period, $PeriodUnit)
    {
        // TODO: Implement describeRenewPrice() method.
    }

    /**
     * 登陆第三方的控制平台
     * @param $ecs
     * @return mixed
     */
    public function describeControlPanel($vhost)
    {
        // TODO: Implement describeControlPanel() method.
    }

    /**
     * 登陆第三方的数据库控制平台
     * @param $ecs
     * @return mixed
     */
    public function describeDatabasePanel($vhost, $param = [])
    {
        $action = "/files?action=GetDirList";
        $p = [
            'p' => 1,
            'showRow' => 100,
            'path' => 'D:/BtSoft/phpmyadmin',
            'is_operating' => true,
        ];
        $resp = $this->request($action, $p);
        $filename = "";
        foreach ($resp['LIST'] as $item) {
            if (stripos($item['filename'], "phpmyadmin") !== false) {
                $filename = $item['filename'];
            }
        };

        return [
            'content' => "http://{$this->host}:888/{$filename}",
            'type' => 'url',
        ];
    }

    /**
     * 查询可使用的数据库
     * @param $vhost
     * @return mixed
     */
    public function DescribeDatabase($vhost)
    {
        // TODO: Implement DescribeDatabase() method.
    }

    /**
     * 修改密码
     * @param $vhost
     * @param $password
     * @return mixed
     */
    public function ModifyInstancePasswd($vhost, $password)
    {
        $ftp_resp = $this->GetData("ftps", $vhost['chrDomain']);
        $action = "/ftp?action=SetUserPassword";
        $p = [
            'id' => $ftp_resp['data'][0]['id'],
            'ftp_username' => $vhost['UserName'],
            'new_password' => $password,
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    /**
     * 更换数据库
     * @param $vhost
     * @param array $param
     * @return mixed
     */
    public function ExchangeDatabase($vhost, $param = [])
    {
        // TODO: Implement ExchangeDatabase() method.
    }

    /**
     * 更换服务器
     * @param $vhost
     * @param array $param
     * @return mixed
     */
    public function ExchangeInstance($vhost, $param = [])
    {
        // TODO: Implement ExchangeInstance() method.
    }

    /**
     * 域名绑定
     * @param $vhost
     * @param $domain
     * @return mixed
     */
    public function BindDomain($vhost, $domain)
    {
        $action = "/site?action=AddDomain";
        $p = [
            'domain' => $domain,
            'webname' => $vhost['chrDomain'],
            'id' => $vhost['remoteID'],
        ];
        $logID = $this->logRequest(array_merge($p, ['action' => $action]));
        $resp = $this->request($action, $p);
        $this->logResponse($logID, $resp);
        if($resp['status'] === true){
            return true;
        }elseif (stripos($resp['msg'], "指定域名已绑定过") !== false){
            // 判断 已绑定的域名是否和当前主机id一致
            $GetData = $this->GetData('sites', $domain);
            if($GetData['data']&&$GetData['data'][0]['id']==$vhost['remoteID']){
                return true;
            }
        }
        return $resp['msg'];
    }

    public function sign($params)
    {
        $now_time = time();
        $sign = [
            'request_token' => md5($now_time . '' . md5($this->key)),
            'request_time' => $now_time
        ];
        return array_merge($params, $sign);
    }

    public function request($action, $params = [])
    {
        $query = $this->sign($params);
        try {
            $resp = $this->client->request('POST', "http://{$this->host}:{$this->port}/{$action}", ['form_params' => $query, 'verify' => false,]);
            $content = $resp->getBody()->getContents();
            return json_decode($content, 1) !== null ? json_decode($content, 1) : $content;
        } catch (\Exception $e) {
            return ['status' => 'failed', 'message' => 'remote api error' . $e->getMessage()];
        }
    }

    /**
     * 创建实例
     * \panel\data\defaultDoc.html
     * @param $vhost
     * @param $Period
     * @param $PeriodUnit
     * @param bool $DryRun
     * @return mixed
     */
    public function CreateInstance($vhost, $Period, $PeriodUnit, $DryRun = false)
    {
        $versionInfo = $this->DescribePHPVersion();
        $product = Product::find($vhost['fIDProd']);
        $version = $versionInfo[count($versionInfo) - 1]['version'];
        $type = "PHP";
        $systeminfo = $this->GetSystemTotal();
        if (stripos($systeminfo['system'], "centos") !== false) {
            $basePath = "/www/wwwroot/";
        } else {
            $basePath = "D:/";
        }
        $path = "{$basePath}{$product['Space']}/{$vhost['chrDomain']}";
        $datauser = $vhost['UserName'];
        $datapassword = $vhost['Password'];
        $database = VhostDB::whereIn('fIDIDProd', ["h{$vhost['IDVHost']}", "ch{$vhost['IDVHost']}"])
            ->with(['product'])
            ->first();
        if ($database && preg_match("/mysql/i", $database['product']['chrScript'])) {
            $datauser = $database['DBLogin'];
            $datapassword = $database['Password'] ? $database['Password'] : $vhost['Password'];
        }
        $p = [
            'webname' => json_encode(['domain' => $vhost['chrDomain'], 'domainlist' => [], 'count' => 0], JSON_UNESCAPED_UNICODE),
            'check_dir' => 1,
            'path' => $path,
            'type_id' => 0,
            'type' => $type, //Asp Php
            'port' => '80',
            'ftp' => 'true',
            'ftp_username' => $vhost['UserName'],
            'ftp_password' => $vhost['Password'],
            'sql' => 'true',
//            'sql' => 'SQLServer',
            'codeing' => 'utf8mb4',
            'datauser' => $datauser,
            'datapassword' => $datapassword,
            'version' => $version,
            'ps' => $vhost['UserName'],
        ];
        $action = "/site?action=AddSite";
        $logID = $this->logRequest(array_merge($p, ['action' => $action]));
        $resp = $this->request($action, $p);
        $this->logResponse($logID, $resp);
        if (isset($resp['status']) && !$resp['status']) return $resp['msg'];
        // 设置过期时间
        $p = [
            'id' => $resp['siteId'],
            'edate' => date("Y-m-d", strtotime($vhost['dtExpired'])),
        ];
        $this->request("/site?action=SetEdate", $p);

        //设置数据库可全部人访问
        $p = [
            'name' => $vhost['UserName'],
            'dataAccess' => '%',
            'access' => '%',
        ];
        $this->request("/database?action=SetDatabaseAccess", $p);


        $this->ChangePHPVersion($vhost, $version);


        return $resp;
    }

    /**
     * 开机
     * @return mixed
     */
    public function StartInstance($vhost)
    {
        $action = "/site?action=SiteStart";
        $p = [
            'id' => $vhost['remoteID'],
            'name' => $vhost['chrDomain']
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    /**
     * 关机
     * @return mixed
     */
    public function StopInstance($vhost)
    {
        $action = "/site?action=SiteStop";
        $p = [
            'id' => $vhost['remoteID'],
            'name' => $vhost['chrDomain']
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function GetData($table, $search = "", $p = 1, $limit = 20, $type = null)
    {
        $action = "/data?action=getData";
        $p = [
            'table' => $table,
            'search' => $search,
            'p' => $p,
            'limit' => $limit,
        ];
        if ($type !== null) {
            $p['type'] = $type;
        }
        $resp = $this->request($action, $p);
        return $resp['data'] && is_array($resp['data']) ? $resp : $resp['data'];
    }

    /**
     * 修改数据库密码
     * @param $vhost
     * @param $password
     * @return mixed
     */
    public function ModifyDatabasePasswd($vhost, $password, $param = [])
    {
        $data_resp = $this->GetData("databases", $vhost['UserName']);
        $action = "/database?action=ResDatabasePassword";
        $p = [
            'id' => $data_resp['data'][0]['id'],
            'name' => $vhost['UserName'],
            'password' => $password,
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function upgradeInstance($vhost, $param = [])
    {
        $systeminfo = $this->GetSystemTotal();
        $product = Product::find($vhost['fIDProd']);
        $newProduct = Product::find($param['new_product_id']);
        if (stripos($systeminfo['system'], "centos") !== false) {
            $basePath = "/www/wwwroot/";
        } else {
            $basePath = "D:/";
        }

        //检查文件夹是否存在
        $action = "/files?action=CheckExistsFiles";
        $p = [
            'dfile' => "{$basePath}{$newProduct['Space']}",
            'filename' => $vhost['chrDomain']
        ];
        $logID = $this->logRequest(array_merge($p, ['action' => $action]));
        $resp = $this->request($action, $p);
        $this->logResponse($logID, $resp);

        if (empty($resp)) {
            //目标不存在进行复制项目文件夹
            $action = "/files?action=CopyFile";
            $p = [
                'sfile' => "{$basePath}{$product['Space']}/{$vhost['chrDomain']}",
                'dfile' => "{$basePath}{$newProduct['Space']}/{$vhost['chrDomain']}",
            ];
            $logID = $this->logRequest(array_merge($p, ['action' => $action]));
            $resp = $this->request($action, $p);
            $this->logResponse($logID, $resp);
            if ($resp['status'] !== true) return $resp['msg'];
            sleep(3);
        }

        $action = "/site?action=SetPath";
        $p = [
            'id' => strval($vhost['remoteID']),
            'path' => "{$basePath}{$newProduct['Space']}/{$vhost['chrDomain']}",
        ];
        $logID = $this->logRequest(array_merge($p, ['action' => $action]));
        $resp = $this->request($action, $p);
        $this->logResponse($logID, $resp);
        sleep(2);
        $ftpArray = $this->GetData("ftps", $vhost['UserName']);
        if(empty($ftpArray)||$ftpArray['data'][0]['path']!="{$basePath}{$newProduct['Space']}/{$vhost['chrDomain']}"){
            //删除原来的ftp账号
            $ftp_remote_id = $ftpArray['data'][0]['id'];
            $action = "/ftp?action=DeleteUser";
            $p = [
                'id' => strval($ftp_remote_id),
                'username' => $vhost['UserName'],
            ];
            $logID = $this->logRequest(array_merge($p, ['action' => $action]));
            $this->request($action, $p);
            $this->logResponse($logID, $resp);

            sleep(2);

            //切换ftp
            $action = "/ftp?action=AddUser";
            $p = [
                'ftp_username' => strval($vhost['UserName']),
                'ftp_password' => strval($vhost['Password']),
                'path' => "{$basePath}{$newProduct['Space']}/{$vhost['chrDomain']}",
                'ps' => $vhost['UserName'],
            ];
            $logID = $this->logRequest(array_merge($p, ['action' => $action]));
            $this->request($action, $p);
            $this->logResponse($logID, $resp);
        }
        return $resp['status'] === true || $resp['msg'] == '与原路径一致，无需修改!' ? true : $resp['msg'];
    }

    /**
     * 续费实例
     * @param $vhost
     * @param $Period
     * @param $PeriodUnit
     * @return mixed
     */
    public function RenewInstance($vhost, $Period, $PeriodUnit)
    {
        $action = "/site?action=SetEdate";
        // 设置过期时间
        $p = [
            'id' => $vhost['remoteID'],
            'edate' => date("Y-m-d", strtotime("{$vhost['dtExpired']} + {$Period} {$PeriodUnit}")),
        ];
        $logID = $this->logRequest(array_merge($p, ['action' => $action]));
        $resp = $this->request($action, $p);
        $this->logResponse($logID, $resp);
        if ($resp['status'] === true) {
            $this->StartInstance($vhost);
        }
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function GetSystemTotal()
    {
        $action = "/system?action=GetSystemTotal";
        $resp = $this->request($action);
        return $resp;
    }

    public function GetSystemConfig()
    {
        $action = "/config?action=get_config";
        $resp = $this->request($action);
        return $resp;
    }

    public function DescribePHPVersion()
    {
        $action = "/site?action=GetPHPVersion";
        $resp = $this->request($action);
        $data = [];
        foreach ($resp as $item) {
            if ($item['version'] > 0) {
                $data[] = [
                    'version' => $item['version'],
                    'name' => $item['name'],
                ];
            }
        }
        return $data;
    }

    public function GetPHPVersion($vhost)
    {
        $action = "/site?action=GetSitePHPVersion";
        $p = [
            'siteName' => $vhost['chrDomain']
        ];
        $resp = $this->request($action, $p);
        return ['Version' => $resp['phpversion']];
    }

    public function ChangePHPVersion($vhost, $version)
    {
        $action = "/site?action=SetPHPVersion";
        $p = [
            'siteName' => $vhost['chrDomain'],
            'version' => $version,
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }


    /**
     * 域名解绑
     * @param $vhost
     * @param $domain
     * @return mixed
     */
    public function RemoveBindDomain($vhost, $domain)
    {
        $action = "/site?action=DelDomain";
        $p = [
            'domain' => $domain,
            'webname' => $vhost['chrDomain'],
            'id' => $vhost['remoteID'],
            'port' => 80,
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function GetIndex($vhost)
    {
        $action = "/site?action=GetIndex";
        $p = [
            'id' => $vhost['remoteID'],
        ];
        $resp = $this->request($action, $p);
        return explode(",", $resp);
    }

    public function SetIndex($vhost, $indexArray = [])
    {
        $action = "/site?action=SetIndex";
        $p = [
            'id' => $vhost['remoteID'],
            'Index' => implode(",", $indexArray)
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function CreateBackup($vhost)
    {

        $DescribeBackup = $this->DescribeBackup($vhost);
        if (count($DescribeBackup) >= 5) {
            return "count.limit";
        }

        $action = "/site?action=ToBackup";
        $p = [
            'id' => $vhost['remoteID']
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function DescribeBackup($vhost, $param = [])
    {
        $GetSystemConfig = $this->GetSystemConfig();

        $action = "/files?action=GetDirList";
        $p = [
            'p' => 1,
            'showRow' => 100,
            'path' => "{$GetSystemConfig['backup_path']}/site",
            'search' => $vhost['chrDomain'],
        ];
        $resp = $this->request($action, $p);
        $data = [];
        foreach ($resp['LIST'] as $item) {
            if (!$item['down_id']) {
                $action = "/files?action=create_download_url";
                $p = [
                    'filename' => "{$GetSystemConfig['backup_path']}/site/{$item['filename']}",
                    'ps' => $item['filename'],
                    'password' => '',
                    'expire' => 1130800,
                ];
                $create_download = $this->request($action, $p);
                $down_id = $create_download['msg']['id'];
            } else {
                $down_id = $item['down_id'];
            }
            $get_download_url_find = $this->request("/files?action=get_download_url_find", [
                'id' => $down_id,
            ]);
            $data[] = [
                'id' => $item['id'],
                'filename' => $item['filename'],
                'created_at' => date("Y-m-d H:i:s", $item['mtime']),
                'size' => $item['size'],
                'url' => "http://{$this->host}:8888/down/{$get_download_url_find['token']}"
            ];
        }
        return $data;
    }

    public function RemoveBackup($vhost, $filename, $param = [])
    {

        $backup_remote_id = 0;
        $DataArray = $this->GetData('backup', $vhost['remoteID'], 1, 20, 0);
        foreach ($DataArray['data'] as $item) {
            if ($filename == $item['name']) {
                $backup_remote_id = $item['id'];
                break;
            }
        }
        if (!$backup_remote_id) {
            return true;
        }
        $action = "/site?action=DelBackup";
        $p = [
            'id' => $backup_remote_id
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function DescribeAccessLog($vhost, $param = [])
    {
        $action = "/site?action=GetSiteLogs";
        $p = [
            'siteName' => $vhost['chrDomain'],
        ];
        $resp = $this->request($action, $p);
        if (!$resp['status']) {
            return $resp['msg'];
        }

        $action = "/files?action=GetDirList";
        $p = [
            'p' => 1,
            'showRow' => 100,
            'path' => $resp['path'],
            'is_operating' => true,
        ];
        $fileResp = $this->request($action, $p);
        $data = [];
        foreach ($fileResp['LIST'] as $item) {
            $data[] = [
                'name' => $item['filename'],
            ];
        }

        return [
            'Content' => $resp['msg']
        ];
    }

    public function DownloadAccessLog($vhost, $param = [])
    {
        //获取文件夹位置
        $action = "/site?action=GetSiteLogs";
        $p = [
            'siteName' => $vhost['chrDomain'],
        ];
        $resp = $this->request($action, $p);
        if (!$resp['status']) {
            return $resp['msg'];
        }
        $fileArray = explode("/", $resp['path']);
        $sfile = array_pop($fileArray);
        $basePath = implode("/", $fileArray);


//        //删除文件
//        $action = "/files?action=DeleteFile";
//        $p = [
//            'path' => "{$basePath}/{$sfile}.zip"
//        ];
//        $this->request($action, $p);

        //压缩文件
        $action = "/files?action=Zip";
        $p = [
            'sfile' => $sfile,
            'dfile' => "{$basePath}/{$sfile}.zip",
            'z_type' => 'zip',
            'path' => "{$basePath}/",
        ];
        $resp = $this->request($action, $p);
        if (!$resp['status']) return $resp['msg'];

        $action = "/files?action=GetDirList";
        $p = [
            'p' => 1,
            'showRow' => 100,
            'path' => $basePath,
            'search' => "{$sfile}.zip",
        ];
        $resp = $this->request($action, $p);
        if (isset($resp["LIST"]) && count($resp["LIST"]) > 0 && $resp["LIST"][0]['down_id']) {
            $get_download_url_find = $this->request("/files?action=get_download_url_find", [
                'id' => $resp["LIST"][0]['down_id'],
            ]);
            $token = $get_download_url_find['token'];
        } else {
            //生成外链
            $action = "/files?action=create_download_url";
            $p = [
                'filename' => "{$basePath}/{$sfile}.zip",
                'ps' => "{$sfile}.zip",
                'password' => '',
                'expire' => 1130800,
            ];
            $create_download_url = $this->request($action, $p);
            $token = $create_download_url['msg']['token'];

        }
        return [
            'type' => 'url',
            'Content' => "http://{$this->host}:{$this->port}/down/{$token}",
        ];
    }

    public function DescribeNetVersion($vhost)
    {
        $action = "/site?action=get_iis_net_versions";
        $resp = $this->request($action);
        return $resp;
    }

    public function ModifyNetVersion($vhost, $version, $param = [])
    {
        $action = "/site?action=set_iis_apppool";
        $p = [
            'model' => 'Integrated',  // Integrated  集成    Classic 经典
            'net_version' => "{$version}",
            'enable32BitAppOnWin64' => "true",
            'queueLength' => "10000",
            'name' => $vhost['chrDomain'],
        ];
        if (isset($param['Model']) && $param['Model']) {
            $p['model'] = $param['Model'];
        }
        $logID = $this->logRequest(array_merge($p, ['action' => $action]));
        $resp = $this->request($action, $p);
        $this->logResponse($logID, $resp);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function GetNetConfig($vhost)
    {
        $action = "/site?action=get_net_version_byaspp";
        $p = [
            'name' => $vhost['chrDomain']
        ];
        return $this->request($action, $p);
    }

    public function ChangeApppoolStatus($vhost, $status)
    {
        $action = "/site?action=set_apppool_status";
        $p = [
            'name' => $vhost['chrDomain'],
            'status' => $status,
        ];
        $logID = $this->logRequest(array_merge($p, ['action' => $action]));
        $resp = $this->request($action, $p);
        $this->logResponse($logID, $resp);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function GetRewriteList($vhost)
    {
        $action = "/site?action=GetRewriteList";
        $p = [
            'siteName' => $vhost['chrDomain']
        ];
        $resp = $this->request($action, $p);
        $data = [];
        foreach ($resp["rewrite"] as $item) {
            $data[] = $item == '0.当前' ? 'self' : $item;
        }
        return $data;
    }

    public function GetFileBody($vhost, $template)
    {
        $systeminfo = $this->GetSystemTotal();
        if (stripos($systeminfo['system'], "centos") !== false) {
            $basePath = "/www/wwwroot/";
        } else {
            $basePath = "D:/";
        }
        $action = "/files?action=GetFileBody";
        $p = [
            'path' => "{$basePath}/BtSoft/panel/rewrite/iis/{$template}.conf"
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? [
            'content' => $resp['data']
        ] : $resp['msg'];
    }

    public function GetSiteRewrite($vhost)
    {
        $action = "/site?action=GetSiteRewrite";
        $p = [
            'siteName' => $vhost['chrDomain'],
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? [
            'content' => $resp['data']
        ] : $resp['msg'];
    }

    public function SetSiteRewrite($vhost, $content)
    {
        $action = "/site?action=SetSiteRewrite";
        $p = [
            'siteName' => $vhost['chrDomain'],
            'data' => $content,
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function DescribeSiteErrorPages($vhost)
    {
        $action = "/site?action=get_site_error_pages";
        $p = [
            'name' => $vhost['chrDomain'],
        ];
        $resp = $this->request($action, $p);
        $data = [];
        foreach ($resp['list'] as $item) {
            $data[] = [
                'code' => $item['statusCode'],
                'path' => $item['path'],
                'mode' => $item['responseMode'] == 'File' ? 'default' : 'self'
            ];
        }
        return $data;
    }

    public function SetErrorPage($vhost, $code, $path, $param = [])
    {
        if (stripos($path, "%SystemDrive%") !== false) {
            return "path.error";
        }
        $action = "/site?action=set_error_page_bycode";
        $p = [
            'code' => $code,
            'responseMode' => 'ExecuteURL',
            'path' => "/{$path}",
            'name' => $vhost['chrDomain']
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function ResetErrorPage($vhost, $code, $param = [])
    {
        $action = "/site?action=re_error_page_bycode";
        $p = [
            'code' => $code,
            'name' => $vhost['chrDomain']
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function UnZip($vhost, $filename)
    {
        $action = "/files?action=UnZip";
        $p = [
            'sfile' => "D:/{$vhost['Quota']}/{$vhost['chrDomain']}/{$filename}",
            'dfile' => "D:/{$vhost['Quota']}/{$vhost['chrDomain']}",
            'type' => "zip",
            'coding' => "UTF-8",
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function GetNetWork()
    {
        $action = "/system?action=GetNetWork";
        return $this->request($action);
    }

    public function StartFtp($vhost)
    {
        $GetData = $this->GetData('ftps', $vhost['UserName']);
        $action = "/ftp?action=SetStatus";
        $p = [
            'id' => $GetData['data'][0]['id'],
            'username' => $vhost['UserName'],
            'status' => 1,
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function StopFtp($vhost)
    {
        $GetData = $this->GetData('ftps', $vhost['UserName']);
        $action = "/ftp?action=SetStatus";
        $p = [
            'id' => $GetData['data'][0]['id'],
            'username' => $vhost['UserName'],
            'status' => 0,
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }


    private function get_mssql_row($database, $query)
    {
        $dbcfg = [
            'server' => $this->host,
            'username' => 'sa',
            'password' => $this->mssql_password,
            'database' => 'master',
        ];
        if (function_exists('mssql_connect')) {
            $link = @mssql_connect($dbcfg['server'], $dbcfg['username'], $dbcfg['password']);
            mssql_select_db($dbcfg['database'], $link);
            $res = @mssql_query($query, $link);
            $row = @mssql_fetch_assoc($res);
            mssql_free_result($res);
            @mssql_close($link);
        } elseif (function_exists('odbc_pconnect')) {
            $conn = odbc_pconnect("Driver={ODBC Driver 17 for SQL Server};Server={$dbcfg['server']};DataBase={$dbcfg['database']}", $dbcfg['username'], $dbcfg['password']);
            $result = odbc_exec($conn, $query);
            $row = odbc_fetch_array($result);
            odbc_close($conn);
        } elseif (function_exists('sqlsrv_connect')) {
            $connectionInfo = array("Database" => $dbcfg['database'], "UID" => $dbcfg['username'], "PWD" => $dbcfg['password']);
            $link = sqlsrv_connect($dbcfg['server'], $connectionInfo);
            $result = sqlsrv_query($link, $query);
            $row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC);
            sqlsrv_close($link);
        } else {
            $host = "sqlsrv:Server=" . str_replace(":", ",", $dbcfg['server']) . ";Database=" . $dbcfg['database'] . ";";
            $obj = new PDO($host, $dbcfg['username'], $dbcfg['password']);
            $row = [];
            foreach ($obj->query($query) as $val) {
                $row = $val;
                break;
            }
        }
        return $row;
    }

    /**
     * 创建数据库
     */
    public function AddDatabase($vhost, $siteId)
    {
        $datauser = "{$vhost['UserName']}_ms";

        $datapassword = $vhost['Password'];
        $database = VhostDB::whereIn('fIDIDProd', ["h{$vhost['IDVHost']}", "ch{$vhost['IDVHost']}"])
            ->with(['product'])
            ->first();
        if ($database && !preg_match("/mysql/i", $database['product']['chrScript'])) {
            $datauser = $database['DBLogin'];
            $datapassword = $database['Password'] ? $database['Password'] : $vhost['Password'];
        }
        //数据库不能字母开头,如果迁移后的ftp是数字开通的,更换一下数据库名
        if (intval($datauser[0]) > 0) {
            $datauser = "h{$datauser}";
        }

        $action = "/database?action=AddDatabase";
        $p = [
            'name' => $datauser,
            'codeing' => "utf8",
            'db_user' => $datauser,
            'password' => $datapassword,
            'dtype' => 'SQLServer',
            'contact' => $siteId,
            'dataAccess' => '127.0.0.1',
            'address' => '127.0.0.1',
            'ps' => $datauser,
        ];
        $logID_AddDatabase = $this->logRequest(array_merge($p, ['action' => $action]));
        $AddDatabaseResp = $this->request($action, $p);
        $this->logResponse($logID_AddDatabase, $AddDatabaseResp);

        if ($AddDatabaseResp['status'] === true) {
            try {
                $this->get_mssql_row("{$vhost['UserName']}_ms", "ALTER DATABASE [{$vhost['UserName']}_ms] MODIFY FILE ( NAME = N'{$vhost['UserName']}_ms', MAXSIZE = 100MB )");
            } catch (\Throwable $e) {
                WebLog::log("{$vhost['UserName']} 修改mssql容量失败:" . $e->getMessage());
            }
        }

        return $AddDatabaseResp['status'] === true ? true : $AddDatabaseResp['msg'];
    }

    public function BatchRemoveCrontab($vhost)
    {
        $action = "/crontab?action=GetCrontab";
        $p = [
            'page' => 1,
        ];
        $CrontabList = $this->request($action, $p);
        foreach ($CrontabList as $crontab) {
            if ($crontab['sType'] == 'database' && in_array($crontab['sName'], ["{$vhost['UserName']}_ms", $vhost['UserName']])) {
                $this->RemoveCrontab(['id' => $crontab]);
            } elseif ($crontab['sType'] == 'site' && $crontab['sName'] == $vhost['chrDomain']) {
                $this->RemoveCrontab(['id' => $crontab]);
            }
        }
    }

    public function RemoveCrontab($crontab)
    {
        $action = "/crontab?action=DelCrontab";
        $p = [
            'id' => $crontab['id'],
        ];
        $resp = $this->request($action, $p);
        return $resp['status'] === true ? true : $resp['msg'];
    }

    public function BatchAddCrontab($vhost)
    {
        //创建计划任务定时备份
        $action = "/crontab?action=AddCrontab";
        $p = [
            'sType' => 'site',
            'name' => "备份网站[{$vhost['chrDomain']}]",
            'type' => 'day',
            'hour' => 1,
            'minute' => 30,
            'sName' => $vhost['chrDomain'],
            'backupTo' => 'localhost',
            'save' => 3,
            'sBody' => '',
        ];
        $logID_AddCrontab = $this->logRequest(array_merge($p, ['action' => $action]));
        $AddCrontabResp = $this->request($action, $p);
        $this->logResponse($logID_AddCrontab, $AddCrontabResp);


        $databaseList = VhostDB::whereIn('fIDIDProd', ["h{$vhost['IDVHost']}", "ch{$vhost['IDVHost']}"])
            ->with(['product'])
            ->get();
        $mysql_sName = $vhost['UserName'];
        $mssql_sName = "{$vhost['UserName']}_ms";
        foreach ($databaseList as $database) {
            if (preg_match("/mysql/i", $database['product']['chrScript'])) {
                $mysql_sName = $database['DBLogin'];
            } else {
                $mssql_sName = $database['DBLogin'];
            }
        }

        $p = [
            'sType' => 'database',
            'name' => "备份数据库[{$vhost['UserName']}]",
            'type' => 'day',
            'hour' => 2,
            'minute' => 30,
            'sName' => $mysql_sName,
            'backupTo' => 'localhost',
            'save' => 3,
            'sBody' => '',
        ];
        $this->request($action, $p);

        $p = [
            'sType' => 'database',
            'name' => "备份数据库[{$vhost['UserName']}_ms]",
            'type' => 'day',
            'hour' => 2,
            'minute' => 30,
            'sName' => $mssql_sName,
            'backupTo' => 'localhost',
            'save' => 3,
            'sBody' => '',
        ];
        $this->request($action, $p);
    }

    public function DescribeInstanceMonitorData($vhost, $param = [])
    {
        $action = "/files?action=get_path_size";
        $p = [
            'path' => "D:/{$vhost['Quota']}/{$vhost['chrDomain']}",
        ];
        $sizeResp = $this->request($action, $p);
        return [
            'Size' => $sizeResp['size']
        ];
    }
}

```