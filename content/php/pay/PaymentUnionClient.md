---
title: "PaymentUnionClient"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

```php
class PaymentUnionClient implements PaymentClientInterface
{

        /* @var GuzzleHttp\Client* */
        private $client;
    
        const API_NAME = "union";
    
    
        /**
         * 支付请求
         * @param $order_out_no
         * @param $total_fee
         * @param array $param
         * @return mixed
         */
        public function __construct()
        {
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
                $http_type = ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https')) ? 'https://' : 'http://';
                $returnUrl = $http_type . '/payment/unionpay_result.php?';//返回URL
                $notifyUrl = $http_type . '/payment/unionpay_result.php?';//通知URL
                $p = [
                    'version' => '1.0.0',
                    'charset' => 'UTF-8',
                    'merId' => $this->apiConfig->ExtraConfig['merId'],
                    'merAbbr' => 'merAbbr',
                    'acqCode' => '',
                    'merCode' => '',
        
                    'transType' => '01',
                    'origQid' => '',
                    'commodityUrl' => '',
                    'commodityName' => '',
                    'commodityUnitPrice' => $total_fee * 100,
                    'commodityQuantity' => 1,
                    'commodityDiscount' => 0,
                    'transferFee' => 0,
                    'orderNumber' => $out_trade_no,
                    'orderAmount' => $total_fee * 100,
                    'orderCurrency' => '156',
                    'orderTime' => date('YmdHis'),
                    'customerIp' => '',
                    'customerName' => '',
                    'defaultPayType' => '',
                    'defaultBankNumber' => '',
                    'transTimeout' => '300000',
                    'merReserved' => '',
                    'frontEndUrl' => $returnUrl,
                    'backEndUrl' => $notifyUrl,
                ];
                $url=$this->apiConfig->Host."/api/Pay.action";
                $p=$this->sign($p);
                $str = "<form id='myform1' method='post' action='{$url}' target='_blank' >";
                foreach ($p as $key => $value) {
                    $str .= "<input type='hidden' name='{$key}' id='{$key}' value='{$value}'/>";
                }
                $str .= '</form>';
                return ['content' => $str, 'Type' => 'form'];
            }
        
            public function sign($p){
                $prestr="";
                ksort($p);
                reset($p);
        
                foreach ($p as $key=>$value){
                    $prestr.="{$key}={$value}&";
                }
                $p['signMethod']='MD5';
                $p['signature']=md5($prestr.md5($this->apiConfig->ExtraConfig['sucurity_key']));
                return $p;
            }
}

```