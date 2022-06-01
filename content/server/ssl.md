---
title: "SSL证书"
date: 2022-05-31T09:04:00+08:00
---  


1. 申请SSL证书,对于个人的需要列出几种免费获取证书的方式  
阿里云，腾讯云，七牛云  
注意：阿里云证书的领取限制是一个自然年内可以领取一次数量为20的云盾单域名试用证书

![步骤1](/images/content/server/ssl_aliyun_001.jpg)  
![步骤1](/images/content/server/ssl_aliyun_002.jpg)  
![步骤1](/images/content/server/ssl_tencent_001.jpg)  

2. 部署证书  
nginx流程  
```
server
{
    ssl_certificate    fullchain.pem;
    ssl_certificate_key    privkey.pem;
    ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
}
```     
apache流程
```
   <VirtualHost *:443>
DocumentRoot "project_path"
ServerName domain.com:443
ErrorLog error_log_ssl
SSLEngine on
SSLProtocol ALL -SSLv2 -SSLv3
#SSLCipherSuite ALL:!ADH:!EXPORT56:RC4+RSA:+HIGH:+MEDIUM:+LOW:+SSLv2:+EXP:+eNULL
SSLCipherSuite HIGH:MEDIUM:!aNULL:!MD5:!RC4
SSLCertificateFile /etc/httpd/conf.d/tls/crt
SSLCertificateKeyFile /etc/httpd/conf.d/tls/key
SSLCertificateChainFile /etc/httpd/conf.d/tls/ca-bundle
SSLVerifyClient none
<Files ~ "\.(cgi|shtml|net|php?)$">
SSLOptions +StdEnvVars
</Files>
<Directory "project_path">
Options FollowSymLinks
AllowOverride All
Require all granted
</Directory>
</VirtualHost>
```
