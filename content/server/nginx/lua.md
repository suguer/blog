---
title: "Lua"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

nginx.conf
```conf
server{
       location / {
            access_by_lua_file  /usr/local/openresty/nginx/conf/lua/domain_check.lua;
            index  index.html index.htm;
        }

}
```

限制每个IP一段时间内能访问多少次  
domain_check.lua
```lua
local client = require "resty.websocket.client"
local limit_req = require "resty.limit.req"
local limit_rate = 150
local limit_burst = 50


local limit_req = require "resty.limit.req"
local lim, err = limit_req.new("my_limit_req_store", limit_rate, limit_burst)

-- 这里设置rate=2/s，漏桶桶容量设置为0，（也就是来多少水就留多少水） 
-- 因为resty.limit.req代码中控制粒度为毫秒级别，所以可以做到毫秒级别的平滑处理

if not lim then
--    ngx.log(ngx.ERR, "failed to instantiate a resty.limit.req object: ", err)
    return ngx.exit(500)
end
local key = ngx.var.binary_remote_addr
local delay, err = lim:incoming(key, true)
if not delay then
    if err == "rejected" then
        return ngx.exit(401)
    end
    --此处如果请求超过每秒2次的话，就会报错403 ，禁止访问
    --ngx.log(ngx.ERR, "failed to limit req: ", err)
    return ngx.exit(500)
end

if delay >= 0.001 then
   local excess = err
   ngx.sleep(delay)
end
~                                                                                                                                                                                                                                                                          
~                                                                                                                                                                                                                                                                          
~                  
```