---
title: "config"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

配置文件  
database.py
```python
from urllib import parse
DIALECT = "mysql"
DRIVER = "pymysql"
USERNAME = ""
PASSWORD = ""
HOST = ""
PORT = "3306"
DATABASE = ""

SQLALCHEMY_DATABASE_URI = "{}+{}://{}:{}@{}:{}/{}?charset=utf8". \
    format(DIALECT, DRIVER, USERNAME,  parse.quote_plus(PASSWORD), HOST, PORT, DATABASE)

SQLALCHEMY_TRACK_MODIFICATIONS = False

```

cron.py  
```python
class SchedulerConfig(object):
    JOBS = [
        # {
        #     'id': 'print_job', # 任务id
        #     'func': 'cron.debug:debug', # 任务执行程序
        #     'args': None, # 执行程序参数
        #     'trigger': 'interval', # 任务执行类型，定时器
        #     'seconds': 1, # 任务执行时间，单位秒
        #     'timezone' : 'Asia/Shanghai'
        # }
    ]


```