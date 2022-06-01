---
title: "PaymentClientInterface"
date: 2021-10-31T10:08:33+08:00
weight: 1
---

```php


interface PaymentClientInterface
{

    /**
     * 支付请求
     * @param $order_out_no
     * @param $total_fee
     * @param array $param
     * @return mixed
     */
    public function pay($out_trade_no,$total_fee,$param=[]);

    /**
     * 查询支付结果
     * @return mixed
     */
    public function query($out_trade_no,$param=[]);


    /**
     * 支付回调,由于各支付平台的参数都不同,因此返回原始信息自己处理
     * @param $all
     * @return mixed
     */
    public function handle($all);

}
```