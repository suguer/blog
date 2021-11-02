---
title: "supervisor"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

for example:
```base
[program:hyperf]
command=php bin/hyperf.php start
directory=/www/wwwroot/hyperf-skeleton/
autorestart=true
startsecs=3
startretries=3
stdout_logfile=/www/server/panel/plugin/supervisor/log/hyperf.out.log
stderr_logfile=/www/server/panel/plugin/supervisor/log/hyperf.err.log
stdout_logfile_maxbytes=10MB
stderr_logfile_maxbytes=10MB
user=root
priority=999
numprocs=1
process_name=%(program_name)s_%(process_num)02d
```