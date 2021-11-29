---
title: "selenium"  
date: 2021-10-31T10:08:33+08:00  
weight: 2
---
Selenium是一个用于测试网站的自动化测试工具，支持各种浏览器包括Chrome、Firefox、Safari等主流界面浏览器，同时也支持phantomJS无界面浏览器。  
以下是我在实际使用中对于selenium的一些心得和用法

+  implicitly_wait  
等待浏览器的相应时间,与sleep的区别在于implicitly_wait是设置的值或页面超时优先,而sleep则是固定睡眠时间,我在用的时候则是2个都同时使用.确保页面能顺利加载到需要的数据

+ xpath
如果需要用selenium进行简单的爬虫和模拟浏览,那么xpath的语法是必须要了解明白的,html语言中比起正则,xpath的代码更加清晰和直观

+ click 
对于按钮的点击事件,推荐用
```python
driver.execute_script("arguments[0].click();", nextButton)
```
据说.click()会导致报错,虽然我还没遇到过