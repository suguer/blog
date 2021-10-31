---
title: "Apache"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

#### apacha限制某个目录的php执行
<Directory /public/protected/controllers>
     php_flag engine off
</Directory>  
需要注意网站已经定义的路径，如果涉及到软路径，一律以已经定义的路径为准。