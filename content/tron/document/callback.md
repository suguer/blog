---
title: "Callback"
date: 2021-10-31T20:29:17+08:00  
description: "about user action"
weight: 3
---

{{%alert info%}} 获取回调配置  /api/callback/index  {{%/alert%}}
| Parameter | Default | Description |  
|:--|:--|:--|  

{{%alert info%}} 创建回调配置  /api/callback/create  {{%/alert%}}
| Parameter | Default | Description |  
|:--|:--|:--|  
| key | "" | email,dingtalk,webhook |  
| email | "" | email require ,if multiple; separate  |  
| secret | "" | dingtalk require   |  
| access_token | "" | dingtalk require   |  
| url | "" | webhook  |  

{{%alert info%}} 检查回调配置是否可用  /api/callback/check  {{%/alert%}}   
登录成功将会返回一个Token 其他鉴权接口都会使用该Token
| Parameter | Default | Description |  
|:--|:--|:--|  
| key | "" | email,dingtalk,webhook |  
