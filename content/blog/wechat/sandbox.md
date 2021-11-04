---
title: "Sandbox"
date: 2021-10-31T20:11:38+08:00
weight: 4
---

利用[微信公众平台接口测试帐号](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)为自己搭建一个智能提醒客服,使用前请先安装[easywechat](/blog/wechat/easywecaht)

1. 新增测试模板
如 
| 模板ID | W-xH90FpdDYlh5CmpcHcgwWiCsH7EKohGzofNxfMqnU |    
| 模板标题 | 每日统计 |    
| 模板内容 | {{first.DATA}} 新关注人：{{keyword1.DATA}} 新房号：{{keyword2.DATA}} 新合同：{{keyword3.DATA}} {{remark.DATA}} |    
```php
$config=[
            'app_id' => '',
            'secret' => '',
            'token' => '',
            // 指定 API 调用返回结果的类型：array(default)/collection/object/raw/自定义类名
            'response_type' => 'array',
        
            'oauth' => [
                'scopes'   => ['snsapi_userinfo'],
                'callback' => '',
            ],
            //...
        ];
  $this->app = Factory::officialAccount($config);
   $this->app->template_message->send([
              'touser' => $openid,
              'template_id' => 'W-xH90FpdDYlh5CmpcHcgwWiCsH7EKohGzofNxfMqnU',
              'url' => $url,
              'data' => [
                  'first' => $first,
                  'keyword1' => $keyword1,
                  'keyword2' => $keyword2,
                  'keyword3' => $keyword3,
                  'remark' => $remark,
              ],
          ]);
```