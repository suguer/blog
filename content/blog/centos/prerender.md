---
title: "Prerender"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

预渲染,用于前端单页面的项目,做到被seo收录的

#创建用户
useradd -d /home/prerender -m prerender

#安装nginx
cd /usr/local
wget http://nginx.org/download/nginx-1.16.1.tar.gz
tar -xzf nginx-1.16.1.tar.gz
cd nginx-1.16.1
./configure --with-http_ssl_module
make
make install

#测试prerender
cd /home/prerender
#https://github.com/prerender/prerender
npm install prerender
npm install prerender-memory-cache --save
vi server.js
----------------------------------------------
const prerender = require('prerender');
const server = prerender();

server.use(require('prerender-memory-cache'))

server.start();
----------------------------------------------

node server
#访问
http://ip:3000/render?url=http://www.baidu.com

#配置nginx
#参考https://gist.github.com/thoop/8165802
/usr/local/nginx/sbin/nginx -c /home/prerender/nginx.conf
/usr/local/nginx/sbin/nginx -s stop


nginx.conf
```conf
events {
    worker_connections  1024;
}

http {
	include       /usr/local/nginx/conf/mime.types;
    default_type  application/octet-stream;
	
	# Change YOUR_TOKEN to your prerender token
	# Change example.com (server_name) to your website url
	# Change /path/to/your/root to the correct value
	server {
		listen 81;
		server_name baidu.com;
	 
		root   /data/home/h5;
		index  index.html;

		location / {
			try_files $uri @prerender;
		}
	 
		location @prerender {
			#0 只有搜索引擎访问才走预渲染
			#set $prerender 0;
			set $prerender 1;
			if ($http_user_agent ~* "googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp") {
				set $prerender 1;
			}
			if ($args ~ "_escaped_fragment_") {
				set $prerender 1;
			}
			if ($http_user_agent ~ "Prerender") {
				set $prerender 0;
			}
			if ($uri ~* "\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|doc|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent|ttf|woff|svg|eot)") {
				set $prerender 0;
			}
			
			#resolve using Google's DNS server to force DNS resolution and prevent caching of IPs
			resolver 8.8.8.8;
	 
			if ($prerender = 1) {
				
				#setting prerender as a variable forces DNS resolution since nginx caches IPs and doesnt play well with load balancing
				set $prerender "127.0.0.1:3000";
				rewrite .* /$scheme://$host$request_uri? break;
				proxy_pass http://$prerender;
			}
			if ($prerender = 0) {
				#rewrite .* /index.html break;
			}
		}
	}
}
```