---
title: "PaymentGlobalAlipayClient"
date: 2021-10-31T10:08:33+08:00
weight: 4
---

```php

class PaymentGlobalAlipayClient implements PaymentClientInterface
{

    /* @var GuzzleHttp\Client* */
    private $client;

    const API_NAME = "GlobalAlipay";

    public function __construct()
    {
        try {
            $this->initLogger(-3, 2);
        } catch (\Throwable $e) {

        }
        $this->loadApiConfig(self::API_NAME);
        $this->client = new GuzzleHttp\Client([
            'timeout' => 30.0,
        ]);
    }
    
       /**
         * 支付请求
         * @param $order_out_no
         * @param $total_fee
         * @param array $param
         * @return mixed
         */
        public function pay($out_trade_no, $total_fee, $param = [])
        {
            $p = [
    //            'product_code' => 'NEW_OVERSEAS_SELLER',
                'service' => 'create_forex_trade',
                'partner' => $this->apiConfig->ExtraConfig['partner'],
                'return_url' => $this->apiConfig->ExtraConfig['return_url'],
                'notify_url' => $this->apiConfig->ExtraConfig['notify_url'],
                '_input_charset'=>'utf-8',
                'subject'=>'網上匯入',
                'body'=>'網上匯入',
                'out_trade_no'=>$out_trade_no,
                'total_fee'=>$total_fee,
                'payment_type'=>1,
                'show_url'=>(isset($_SERVER['REQUEST_SCHEME']) && $_SERVER['REQUEST_SCHEME'] ? $_SERVER['REQUEST_SCHEME'] : request()->server('REQUEST_SCHEME'))."://".MAINSITE,
                'seller_email'=>$this->apiConfig->ExtraConfig['seller_email'],
                'currency'=>isset($param['currency'])&&$param['currency']?$param['currency']:"HKD",
            ];
            $action="https://mapi.alipay.com/gateway.do";
            $resp=$this->sign($p);
            return ['content' => $action."?".http_build_query($resp), 'Type' => 'url'];
        }
        
        
            public function sign($p){
                $prestr="";
                ksort($p);
                foreach ($p as $key=>$value){
                    $prestr.="{$key}={$value}&";
                }
                $prestr=trim($prestr,"&");
                $p['sign_type']='MD5';
                $p['sign']=md5($prestr.$this->apiConfig->ExtraConfig['security_code']);
                return $p;
            }
}
```