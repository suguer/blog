---
title: "Easywechat"
date: 2021-10-31T20:11:38+08:00
weight: 1
---

* 支付回调方法
```php 
$config=[
  'app_id' => '',
    'secret' => '',
    'token' => '',          // Token

    'mch_id' => '',
    'trade_type' => 'JSAPI',
    'key' => '',
    'baseurl' => '',
    'PotentialUserBinding' => md5('shop'),

    // 指定 API 调用返回结果的类型：array(default)/collection/object/raw/自定义类名
    'response_type' => 'array',

    'oauth' => [
        'scopes' => ['snsapi_userinfo'],
        'callback' => '',
    ],
]
$app = Factory::payment($config);
$response = $app->handlePaidNotify(function ($message, $fail) {
     $out_trade_no = $message['out_trade_no'];
     $attach = $message['attach'];
     $total_fee = $message['total_fee'];
     $openid=$message['openid']
     // your code ...
     return true;
 });
return $response;
```