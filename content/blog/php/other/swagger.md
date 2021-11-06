---
title: "Swagger"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

[zircote/swagger-php](https://github.com/zircote/swagger-php)
[document](https://zircote.github.io/swagger-php/Supported-annotations.html)
```base
composer require zircote/swagger-php
```

rule:
```php
    @OA\Info(title="Fapi", version="0.1",description="nothing"),
    
    @OA\Server(url="http://www.github.com/",description="github",),
    
     @OA\Schema(
         schema="Pagination",
          @OA\Property(property="current", type="integer"),
          @OA\Property(property="total", type="integer"),
          @OA\Property(property="pageSize", type="integer"),
     )


    @OA\Tag(name="api-tag", description="Tag")
    
      @OA\Post(
          path="/api/index",
          summary="api name",
          operationId="UniqueOperationId",
          tags={"api-tag"},
          @OA\Parameter(in="query", name="fIDDomainFolder", required=false,schema={"type":"string"},description=""),
          @OA\Parameter(in="query", name="intActive", required=false,schema={"type":"integer"},description=""),
          @OA\Parameter(in="query", name="timetype", required=false,schema={"type":"string","enum":{"created_at","expired_at","update_at"}},description="时间类型"),
          @OA\Response(
           response="200",
           description="An example resource",
           @OA\JsonContent(
           @OA\Property(property="Data",type="array", @OA\Items(ref="#/components/schemas/Domain")),
           @OA\Property(property="Pagination",type="object", ref="#/components/schemas/Pagination"),
          )
      ),
      )
     
```

use:
```php

$openapi = \OpenApi\Generator::scan([
    path . 'api',
    path . 'model',
]);
$openapi->toJson()
```

show:
```html

<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
    <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
    <style>
      html
      {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }

      *,
      *:before,
      *:after
      {
        box-sizing: inherit;
      }

      body
      {
        margin:0;
        background: #fafafa;
      }
    </style>
  </head>

  <body>
    <div id="swagger-ui"></div>

    <script src="./swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="./swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script>
    window.onload = function() {
      // Begin Swagger UI call region
      const ui = SwaggerUIBundle({
      urls: [
          {url: "swagger.json", name: 'main'},
          {url: "https://petstore.swagger.io/v2/swagger.json", name: 'example'},
      ],
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
      // End Swagger UI call region

      window.ui = ui;
    };
  </script>
  </body>
</html>
```

