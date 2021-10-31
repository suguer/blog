---
title: "User"
date: 2021-10-31T20:29:17+08:00
---

{{%alert info%}} 获取用户信息  /api/user/info  {{%/alert%}}
| Parameter | Default | Description |  
|:--|:--|:--|  

{{%alert info%}} 创建用户详情  /api/user/create  {{%/alert%}}
| Parameter | Default | Description |  
|:--|:--|:--|
| account | "account" | Account to login |  
| password | "password" | Password to login |  

{{%alert info%}} 登录  /api/user/login  {{%/alert%}}   
登录成功将会返回一个Token 其他鉴权接口都会使用该Token
| Parameter | Default | Description |  
|:--|:--|:--|
| account | "account" | Account to login |  
| password | "password" | Password to login |  
