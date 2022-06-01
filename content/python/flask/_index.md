---
title: "Flask"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

[github](https://github.com/pallets/flask)  

初次使用flask的基本没有什么python经验,因此在目录架构上,我是按照我平常的代码风格进行排版,项目中没有视图,仅用于编写api接口

目录结构  
|- api #api路由,即flask的蓝图  
|- config #项目的配置文件,  
|- cron #计划任务,  
|- model #模型  
|- test #单元测试  
|- requirements.txt  # 所需第三方插件  
  

   
app.py
```python
from api import *  #api路由
from model import  db  #数据库
from config import database, server,cron #隔离配置文件
from flask_apscheduler import APScheduler  # 引入APScheduler


app = Flask(__name__)
app.register_blueprint(UserApi)
app.register_blueprint(RecordApi)
app.config.from_object(database)
app.config.from_object(cron.SchedulerConfig())

db.init_app(app)

scheduler = APScheduler()  # 实例化APScheduler
scheduler.init_app(app)  # 把任务列表放进flask
scheduler.start()  # 启动任务列表

with app.app_context():
    db.create_all()
    
if __name__ == '__main__':
    app.run(debug=server.debug)

```