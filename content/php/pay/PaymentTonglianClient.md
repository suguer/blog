---
title: "PaymentWechatClient"
date: 2021-10-31T10:08:33+08:00
weight: 4
---

```php
class PaymentTonglianClient implements PaymentClientInterface
{

    private $client;

    const API_NAME = "allinpay";

    public function __construct()
    {
        $this->loadApiConfig(self::API_NAME);
        $this->client = new GuzzleHttp\Client([
            'timeout' => 30.0,
        ]);
    }
    
     /**
         * 网关支付
         * @param $out_trade_no
         * @param $total_fee
         * @param array $param
         * @return array
         */
        public function gateway($out_trade_no, $total_fee, $param = [])
        {
            $p = [
                'cusid' => $this->apiConfig->ExtraConfig['cusid'],
                'appid' => $this->apiConfig->Username,
                'charset' => 'UTF-8',
    //            'returl' => '',
                'returl' =>( isset($_SERVER['REQUEST_SCHEME'])&&$_SERVER['REQUEST_SCHEME']?$_SERVER['REQUEST_SCHEME']: request()->server('REQUEST_SCHEME')) . "://" . MAINSITE . "/payment/allinpay_notify_url.php",
                'notifyurl' =>( isset($_SERVER['REQUEST_SCHEME'])&&$_SERVER['REQUEST_SCHEME']?$_SERVER['REQUEST_SCHEME']: request()->server('REQUEST_SCHEME')) . "://" . MAINSITE . "/payment/allinpay_notify_url.php",
                'trxamt' => $total_fee * 100,
                'orderid' => $out_trade_no,
                'randomstr' => time(),
                'gateid' => isset($param['bankid'])&&$param['bankid']?$param['bankid']:"",
                'paytype' =>isset($param['bankid'])&&$param['bankid']?"B2C": 'B2C,B2B',
            ];
            $p['sign'] = $this->sign($p);
            $url = "{$this->apiConfig->Host}/gateway/pay";
            $str = "<form id='myform1' method='post' action='{$url}' target='_blank' >";
            foreach ($p as $key => $value) {
                $str .= "<input type='hidden' name='{$key}' value='{$value}'/>";
            }
            $str .= '</form>';
            return ['content' => $str, 'Type' => 'form'];
        }
        
        
        /**
             * 支付请求
             * 文档url: https://aipboss.allinpay.com/know/devhelp/main.php?pid=15#mid=88
             * @param $order_out_no
             * @param $total_fee
             * @param array $param
             * @return mixed
             */
            public function pay($out_trade_no, $total_fee, $param = [])
            {
                $action = "/unitorder/pay";
                $paytype = "W01";
                if (isset($param['paytype'])) {
                    switch ($param['paytype']) {
                        case "wechat":
                            $paytype = "W01";
                            break;
                        case "alipay":
                            $paytype = "A01";
                            break;
                        case "qq":
                            $paytype = "Q01";
                            break;
                        case "union":
                            $paytype = "U01";
                            break;
                    }
                }
                $p = [
                    'trxamt' => $total_fee * 100,
                    'reqsn' => $out_trade_no,
                    'paytype' => $paytype,
                    'randomstr' => time(),
                    'body' => '充值',
                    'remark' => $out_trade_no,
                    'notify_url' =>( isset($_SERVER['REQUEST_SCHEME'])&&$_SERVER['REQUEST_SCHEME']?$_SERVER['REQUEST_SCHEME']: request()->server('REQUEST_SCHEME')) . "://" . MAINSITE . "/payment/allinpay_notify_url.php",
                ];
        
                $resp = $this->request($action, $p);
                if (isset($resp['errmsg'])) {
                    return $resp['errmsg'];
                }
                $array = [
                    'Type' => 'qrcode_url',
                    'QrcodeUrl' => $resp['payinfo'],
                    'content' => $resp['payinfo'],
                ];
                return $array;
            }
            
            
          public function gateway_query($out_trade_no, $param = [])
            {
                $action="/gateway/query";
                $p=[
                    'orderid'=>$out_trade_no,
                ];
                $resp=$this->request($action,$p);
                return isset($resp['errmsg'])?$resp['errmsg']: $resp;
            }
            
            
            /**
                 * 查询支付结果
                 * @return mixed
                 */
                public function query($out_trade_no, $param = [])
                {
                   $action="/unitorder/query";
                   $p=[
                        'reqsn'=>$out_trade_no,
                   ];
                   $resp=$this->request($action,$p);
                    return isset($resp['errmsg'])?$resp['errmsg']: $resp;
                }

 public function sign($param)
    {
        $param['key'] = $this->apiConfig->Password;
        ksort($param);
        $buff = "";
        foreach ($param as $k => $v) {
            if ($v != "" && !is_array($v)) {
                $buff .= $k . "=" . $v . "&";
            }
        }
        return md5(trim($buff, "&"));
    }

    public function request($action, $param)
    {
        $param['cusid'] = $this->apiConfig->ExtraConfig['cusid'];
        $param['appid'] = $this->apiConfig->Username;
        $param['version'] = $this->apiConfig->ExtraConfig['version'];
        $sign = $this->sign($param);
        $param["sign"] = $sign;
        $content = $this->client->request("POST", $this->apiConfig->Host . $action, [
            'form_params' => $param
        ])->getBody()->getContents();
        return json_decode($content, 1);
    }

    /**
     * 支付回调,由于各支付平台的参数都不同,因此返回原始信息自己处理
     * @param $all
     * @return mixed
     */
    public function handle($all)
    {
        $sign = $all['sign'];
        unset($all['sign']);
        $mySign = $this->sign($all);
        if (strtolower($sign) == strtolower($mySign)) {
            return [
                'out_trade_no' => $all['cusorderid'],
                'amount' => $all['trxamt'] / 100,
                'attach' => isset($all['trxreserved']) ? $all['trxreserved'] : "",
                'created_at' => date("Y-m-d H:i:s", strtotime($all['trxdate'])),
                'payed_at' => date("Y-m-d H:i:s", strtotime($all['paytime'])),
            ];
        }
        return false;

    }

    public function refund($out_trade_no, $total_fee, $param = [])
    {
        $action = "/unitorder/refund";
        $p = [
            'trxamt' => $total_fee * 100,
            'oldreqsn' => $out_trade_no,
            'reqsn'=>"{$out_trade_no}_refund",
            'remark'=>'退款'
        ];
        return $this->request($action, $p);
    }
}

```