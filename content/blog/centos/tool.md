---
title: "常用的安装指南"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

+ CentOS7利用yum安装node.js
```bash
curl -sL https://rpm.nodesource.com/setup_16.x  | bash -
yum install -y nodejs
node -v
```

+ [cnpm安装](https://npmmirror.com/)  
```bash
npm install -g cnpm --registry=https://registry.npmmirror.com
```


+ CentOS7 安装pip3
```bash
yum install epel-release
yum install https://centos7.iuscommunity.org/ius-release.rpm
```