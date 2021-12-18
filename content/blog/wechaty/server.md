---
title: ""
date: 2021-10-31T20:11:38+08:00
weight: 4
---


+ 服务器端
变量说明:
WECHATY_TOKEN : 自定义的token,请注意不要随意泄露,否则可能会被其他人白嫖

```bash
export WECHATY_LOG="verbose"
export WECHATY_PUPPET="wechaty-puppet-wechat"
export WECHATY_PUPPET_SERVER_PORT="8080"
export WECHATY_TOKEN="python-wechaty-yourtoken"
export WECHATY_PUPPET_SERVICE_NO_TLS_INSECURE_SERVER="true"

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

执行成功后的截图如下:
![步骤1](/images/wechaty/001.png "image")
![步骤2](/images/wechaty/002.png "image")