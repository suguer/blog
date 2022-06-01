---
title: "PowerDns"
date: 2021-10-31T10:08:33+08:00
weight: 1
description: "PowerDns"
---

[powerdns](https://doc.powerdns.com/) |
[powerdns_http_api](https://doc.powerdns.com/authoritative/http-api/index.html) |
[download link](https://repo.powerdns.com/)

##### 1、 环境 environment  
系统 centos 7.9

##### 2、 安装 install  powerdns
yum install epel-release yum-plugin-priorities 
curl -o /etc/yum.repos.d/powerdns-auth-45.repo https://repo.powerdns.com/repo-files/centos-auth-45.repo   
yum install pdns  


##### 3、 安装 install pdns-recursor   
yum -y install epel-release yum-plugin-priorities
curl -o /etc/yum.repos.d/powerdns-rec-45.repo https://repo.powerdns.com/repo-files/centos-rec-45.repo
yum -y install pdns-recursor

##### 4、 配置 configure  
修改mysql配置文件  
[mysqld] /etc/my.cnf  
```
innodb_file_per_table = 1 
innodb_flush_log_at_trx_commit = 0
character-set-server=utf8
collation-server=utf8_general_ci
```
```
create database poweradmin;  
grant all on poweradmin.* to puser1@localhost identified by "wisdom123@";  
flush privileges;
```  

mysql -u root poweradmin < /usr/share/doc/pdns-backend-mysql-4.1.10/schema.mysql.sql

[powerdns]  /etc/pdns/pdns.conf
```
api=yes
api-key=123456
api-logfile=/var/log/pdns.log
launch=gmysql
gmysql-host=localhost
gmysql-user=puser1
gmysql-dbname=poweradmin
gmysql-password=mysqlpassword
server-id=ns1.example.com
webserver=yes
webserver-address=0.0.0.0
webserver-allow-from=127.0.0.1
webserver-password=123456
webserver-port=8081
```

##### 5、安装 isntall poweradmin2.1  
wget https://nchc.dl.sourceforge.net/project/poweradmin/poweradmin-2.1.7.tgz  
tar -xvf poweradmin-2.1.7.tgz
cp -r poweradmin-2.1.7 /var/www/html/poweradmin  
cd /var/www/html/poweradmin  
touch inc/config.inc.php  
chmod 777 inc/config.inc.php  
[使用浏览器配置poweradmin](http://ip/poweradmin/install/)

----
1. powerdns 不支持cname空主机头的解析