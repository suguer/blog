---
title: "微信机器人"
date: 2021-10-31T20:11:38+08:00
weight: 4
---

[wechaty](https://wechaty.readthedocs.io/zh_CN/latest/) |
[github](https://github.com/wechaty/python-wechaty/)

+ 服务器端

```bash
export WECHATY_LOG="verbose"
export WECHATY_PUPPET="wechaty-puppet-wechat"
export WECHATY_PUPPET_SERVER_PORT="8080"
export WECHATY_TOKEN="python-wechaty-qweqweqwe123"
export WECHATY_PUPPET_SERVICE_NO_TLS_INSECURE_SERVER="true"
export WECHATY_PUPPET_SERVICE_ENDPOINT="server_ip:8080"

# save login session
if [ ! -f "${WECHATY_TOKEN}.memory-card.json" ]; then
touch "${WECHATY_TOKEN}.memory-card.json"
fi

docker run -ti \
--name wechaty_puppet_service_token_gateway \
--rm \
-v "`pwd`/${WECHATY_TOKEN}.memory-card.json":"/wechaty/${WECHATY_TOKEN}.memory-card.json" \
-e WECHATY_LOG \
-e WECHATY_PUPPET \
-e WECHATY_PUPPET_SERVER_PORT \
-e WECHATY_PUPPET_SERVICE_NO_TLS_INSECURE_SERVER \
-e WECHATY_TOKEN \
-p "$WECHATY_PUPPET_SERVER_PORT:$WECHATY_PUPPET_SERVER_PORT" \
wechaty/wechaty:0.65

```


+ client
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
# os.environ['WECHATY_PUPPET'] = "wechaty-puppet-wechat"
# os.environ['WECHATY_PUPPET_SERVICE_TOKEN'] = "puppet_paimon_e9dcb4db-02e7-44fd-9018-58af3447c411"
# os.environ['WECHATY_PUPPET_SERVICE_ENDPOINT'] = "103.36.193.54:9001"
os.environ['WECHATY_PUPPET_SERVICE_ENDPOINT'] = "103.36.193.54:8080"
os.environ['WECHATY_PUPPET_SERVICE_TOKEN'] = "python-wechaty-qweqweqwe123"


async def on_message(msg: Message):
    """
    Message Handler for the Bot
    """
    if msg.text() == 'ding':
        await msg.say('dong')

        file_box = FileBox.from_url(
            'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/'
            'u=1116676390,2305043183&fm=26&gp=0.jpg',
            name='ding-dong.jpg'
        )
        await msg.say(file_box)


async def on_scan(
        qrcode: str,
        status: ScanStatus,
        _data,
):
    """
    Scan Handler for the Bot
    """
    print('Status: ' + str(status))
    print('View QR Code Online: https://wechaty.js.org/qrcode/' + qrcode)


async def on_login(user: Contact):
    """
    Login Handler for the Bot
    """
    print(user)
    # TODO: To be written


async def main():
    """
    Async Main Entry
    """
    #
    # Make sure we have set WECHATY_PUPPET_SERVICE_TOKEN in the environment variables.
    # Learn more about services (and TOKEN) from https://wechaty.js.org/docs/puppet-services/
    #
    # if 'WECHATY_PUPPET_SERVICE_TOKEN' not in os.environ:
    #     print('''
    #         Error: WECHATY_PUPPET_SERVICE_TOKEN is not found in the environment variables
    #         You need a TOKEN to run the Python Wechaty. Please goto our README for details
    #         https://github.com/wechaty/python-wechaty-getting-started/#wechaty_puppet_service_token
    #     ''')

    bot = Wechaty()

    bot.on('scan', on_scan)
    bot.on('login', on_login)
    bot.on('message', on_message)

    await bot.start()

    print('[Python Wechaty] Ding Dong Bot started.')


asyncio.run(main())


```