---
title: "Nginx"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

###### How to format log (eg: Y-m-d.log)
```conf
http {
    map $host $fmt_localdate { default '';}
    map $host $fmt_localtime { default '';}
    log_by_lua_block {
            ngx.var.fmt_localdate = os.date("%Y-%m-%d");
            ngx.var.fmt_localtime = os.date("%Y-%m-%d %H:%M:%S");
        }
    log_format main '[$host][$remote_addr][$fmt_localtime][$http_referer][$http_user_agent]';
    
    server {    
      access_log  /var/log/nginx/access-$fmt_localdate.log  main;
    }
}
```