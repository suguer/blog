---
title: "Dingtalk"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

[钉钉开放平台](https://open.dingtalk.com/)  
[SDK]() 
```base 
composer require alibabacloud/dingtalk
```

* 钉钉的员工同步
```php
    use AlibabaCloud\SDK\Dingtalk\Voauth2_1_0\Dingtalk;
    use \Exception;
    use AlibabaCloud\Tea\Exception\TeaError;
    use AlibabaCloud\Tea\Utils\Utils;
    
    use Darabonba\OpenApi\Models\Config;
    use AlibabaCloud\SDK\Dingtalk\Voauth2_1_0\Models\GetAccessTokenRequest;
    
    class Demo {
         /**
          * 使用 Token 初始化账号Client
          * @return Dingtalk Client
          */
         public static function createClient(){
             $config = new Config([]);
             $config->protocol = "https";
             $config->regionId = "central";
             return new Dingtalk($config);
         }
         
         
         /**
              * @param string[] $args
              * @return void
              */
             public static function main($args){
                 $client = self::createClient();
                 $getAccessTokenRequest = new GetAccessTokenRequest([
                     "appKey" => "dingeqqpkv3xxxxxx",
                     "appSecret" => "GT-lsu-taDAxxxsTsxxxx"
                 ]);
                 try {
                     $client->getAccessToken($getAccessTokenRequest);
                 }
                 catch (Exception $err) {
                     if (!($err instanceof TeaError)) {
                         $err = new TeaError([], $err->getMessage(), $err->getCode(), $err);
                     }
                     if (!Utils::empty_($err->code) && !Utils::empty_($err->message)) {
                         // err 中含有 code 和 message 属性，可帮助开发定位问题
                     }
                 }
             }
    }
```

* 钉钉的考勤同步