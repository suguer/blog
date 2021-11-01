---
title: "Mysql"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

###### How to show binlog
```
mysqlbinlog --no-defaults --start-datetime="2021-09-30 00:00:00" --stop-datetime="2021-09-30 23:00:00" -d database --base64-output=DECODE-ROWS -v  /binlog/master-bin.001255 --result-file=/root/binlog/mysqllog001255.sql
```

