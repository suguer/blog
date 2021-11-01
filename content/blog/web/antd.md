---
title: "Antd"
date: 2021-10-31T20:49:14+08:00
draft: true
---

# Ant Design Pro

[ant.design](https://ant.design/index-cn)  
[pro.ant.design](https://pro.ant.design/zh-CN)  
[umijs](https://umijs.org/zh-CN)  
后端生成文档: [swagger-php](https://github.com/zircote/swagger-php)  
简单的 icon: [iconfont](https://www.iconfont.cn/?spm=a313x.7781069.1998910419.d4d0a486a)

### Environment Prepare

Install `node_modules`:

```bash
yarn
```

### Start project

```bash
yarn start
```

### OpenAPI

[openapi](https://pro.ant.design/zh-CN/docs/openapi)  
在与后端联调中,接口都采用 src/services/api ,请求接口都根据文件自动生成,请勿直接修改, 开发环境中接口文档打开 /umi/plugin/openapi

### Config
#### 增加 alias
config/config.ts
```
 alias: {
    '@config': resolve(__dirname, '../config'),
  },
```

tsconfig.json
```
compilerOptions:{
 "paths": {
      "@config/*": ["./config/*"]
    }
}
```