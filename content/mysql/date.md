---
title: "Mysql日期函数"
date: 2022-06-09T14:28:00+08:00
---  

当前日期
```shell
select curdate();
```
当月最后一天
```shell
select last_day(curdate());
```
下个月的上一天,例如今天2022-06-01 ,结果为2022-06-30
```shell
select DATE_SUB(DATE_ADD(CURDATE(),INTERVAL 1 MONTH),INTERVAL 1 DAY)
```

下个月的最后一天
```shell
select LAST_DAY(DATE_ADD(CURDATE(),INTERVAL 1 MONTH));
```