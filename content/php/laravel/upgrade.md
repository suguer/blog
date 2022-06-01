---
title: "升级注意事项"
date: 2022-03-22T00:00:00+08:00
weight: 2
---
[官网 ](https://laravel.com/docs/9.x/releases)
现在laravel的最新版已经升级到了9.0,目前公司还在用5.x版本,因此对于升级的注意事项做个记录,当做预防以后的踩坑

注意事项  
1. 同一个设置成支持php7.0,php8,新的9.0仅支持php8以上,为了能平滑迁移项目,需要服务器可支持2个版本
2. 购物车插件gloudemans/shoppingcart 不可使用  , 测试 bumbummen99/shoppingcart 是否可替代
3. 接收参数函数 Input::get() 废弃,用request()->get() 替代
4. $input{$i+1} 花括号不可用 $input[$i+1]
5. Route::controller 隐式控制路由废弃, 使用lesichkovm/laravel-advanced-route 插件 AdvancedRoute::controller 替代
6. 队列在redis上保存的值有较大变动, 
   1. laravel/vendor/laravel/framework/src/Illuminate/Queue/Queue.php createPayload函数 增加部分变量
   2. laravel/vendor/laravel/framework/src/Illuminate/Queue/RedisQueue.php createPayload函数 attempts设置默认为0
7. 原生类的构造函数改成__construct
8. 对于整形和字符串判断更严格了,如mktime 参数必须是int; abs("") 会报错
9. 有用到的废弃函数 create_function 需要更换
10. ORM查询返回的数据永远是obj类型, conf/database.inc.php 设置的$ORM->setFetchMode(PDO::FETCH_ASSOC); 无效,源自 https://laravel.com/docs/5.4/upgrade

以上的记录是我实际的项目产生的问题,因此不一定适合大部分人

正则表达式替换php7的语法警告
```
(\$[a-zA-Z\_]+)\[([a-zA-Z]+[a-zA-Z\_\d]*)\]  
$1['$2']
```

