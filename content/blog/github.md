---
title: "Github"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

目前github已经不允许使用账号密码上传代码,因此可通过设置ssh来上传 
ssh-keygen -t rsa -C "email"  
在 C:\Users\用户\.ssh下  
|- id_rsa  (上传的时候携带该数据)
|- id_rsa.pub  (可在项目或者个人中心设置中添加该数据)