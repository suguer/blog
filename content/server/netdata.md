---
title: "netdata"
date: 2022-05-31T10:34:00+08:00
---  

* 如何用netdata监控redis,[官网教程](https://learn.netdata.cloud/docs/agent/collectors/python.d.plugin/redis)  
![001](/images/content/server/netdata_001.png)
```shell
cd /etc/netdata # Replace this path with your Netdata config directory
sudo ./edit-config go.d/redis.conf
# by tcp socket
redis://<user>:<password>@<host>:<port>

# by unix socket
unix://<user>:<password>@</path/to/redis.sock
```
例如
```
socket1:
  name     : 'local'
  socket   : '/tmp/redis.sock'
  pass     : 'pass'

socket2:
  name     : 'local'
  socket   : '/var/run/redis/redis.sock'
  # pass     : ''

socket3:
  name     : 'local'
  socket   : '/var/lib/redis/redis.sock'
  # pass     : ''

localhost:
  name     : 'local'
  host     : 'localhost'
  port     : 6379
  pass     : 'pass'

localipv4:
  name     : 'local'
  host     : '127.0.0.1'
  port     : 6379
  # pass     : ''

localipv6:
  name     : 'local'
  host     : '::1'
  port     : 6379
  # pass     : ''
```

![002](/images/content/server/netdata_002.jpg)  

