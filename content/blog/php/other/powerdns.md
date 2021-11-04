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
    
3. 开始使用
```php
class DnsPowerDnsClient {
    
}
```    

