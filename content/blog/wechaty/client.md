---
title: ""
date: 2021-10-31T20:11:38+08:00
weight: 4
---

### 客户端  
WECHATY_PUPPET_SERVICE_ENDPOINT: 设置服务端的IP和端口号 
WECHATY_PUPPET_SERVICE_TOKEN: 服务端设置的自定义token值

简单的Example例子代码:
```python
import os
import asyncio
from wechaty_puppet import FileBox  # type: ignore
from wechaty import (
    Contact,
    Message,
    Wechaty,
    ScanStatus,
)

os.environ['WECHATY_PUPPET'] = "wechaty-puppet-service"
os.environ['WECHATY_PUPPET_SERVICE_ENDPOINT'] = "ip:port"
os.environ['WECHATY_PUPPET_SERVICE_TOKEN'] = "python-wechaty-token"


class MyBot(Wechaty):

    def __init__(self) -> None:
        """initialization function
        """
        self.login_user: Optional[Contact] = None
        super().__init__()

    async def on_message(self, msg: Message):
        if msg.is_self():
            return
        """
        Message Handler for the Bot
        """
        print(msg.talker().name)


    async def on_login(self, user: Contact):
        """
        Login Handler for the Bot
        """
        print(user)



async def main() -> None:
    """doc"""
    bot = MyBot()
    await bot.start()


asyncio.run(main())

```
当发给文字给你登录的微信能获得相同的回复,恭喜你环境都已搭建成功,此时一起来学习更多的知识,为自己搭建一个智能微信客服吧