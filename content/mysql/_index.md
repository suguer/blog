---
title: "Mysql"
date: 2021-10-31T10:08:33+08:00
weight: 2
type : "docs"
description: "Mysql数据库"
icon: "/images/index/mysql.png"
---

###### How to show binlog
```bash
mysqlbinlog --no-defaults --start-datetime="2021-09-30 00:00:00" --stop-datetime="2021-09-30 23:00:00" -d database --base64-output=DECODE-ROWS -v  /binlog/master-bin.001255 --result-file=/root/binlog/mysqllog001255.sql
```

###### How to get distance ( lat and lng)
```bash
lat = X
lng = X
select * , ROUND(6378.138 * 2 * ASIN(SQRT(POW(SIN(({$lat} * PI() / 180 - lat * PI() / 180) / 2),2) + COS({$lat} * PI() / 180) * COS(lat * PI() / 180) * POW(SIN(({$lng} * PI() / 180 -   lng * PI() / 180) / 2),2))), 5)*1000 AS distance
from table
order by distance asc 
```