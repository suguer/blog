---
title: "PaymentPaypalClient"
date: 2021-10-31T10:08:33+08:00
weight: 10
---

```php
class PaymentPaypalClient implements PaymentClientInterface
{

    const API_NAME = "Paypal";
    
  public function __construct()
    {
        $this->loadApiConfig(self::API_NAME);
        $this->client = new Client([
            'timeout' => 60.0,
        ]);
    }
    
       public function request($action, $p)
        {
            $resp = $this->client->request('POST', "https://api-3t.paypal.com/nvp", [
                'headers' => [
                    'Content-Type' => 'text/namevalue',
                    'X-VPS-Timeout' => '45',
                    'X-VPS-VIT-Client-Type' => 'PHP/cURL',
                    'X-VPS-VIT-Integration-Product' => 'PHP::Zen Cart - WPP-NVP',
                    'X-VPS-VIT-Integration-Version' => '1.3.8a',
                ],
                'body' => http_build_query($p),
    
            ])
                ->getBody()
                ->getContents();
            $resp = $this->_parseNameValueList(urldecode($resp));
            return $resp;
        }
        
        
        
    function _parseNameValueList($string)
    {
        $string = str_replace('&amp;', '|', $string);
        $pairs = explode('&', str_replace(array("\r\n", "\n"), '', $string));
        //$this->log('['.$string . "]\n\n[" . print_r($pairs, true) .']');
        $values = array();
        foreach ($pairs as $pair) {
            list($name, $value) = explode('=', $pair, 2);
            $values[$name] = str_replace('|', '&amp;', $value);
        }
        return $values;
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
            $currency = isset($param['currency']) && $param['currency'] ? $param['currency'] : "HKD";
            $business = "paypal account";
            $prefixUrl = request()->server('REQUEST_SCHEME') . "://you website url/payment/";
            $url = "https://www.paypal.com/cgi-bin/webscr?locale.x=en_GB";
            $user = User::with('adminContact')->find($param['user_id']);
            $return="paypal_success.php";
            $cancel_return="paypal_error.php";
            if(preg_match("/www(\.t\.|\.l\.|\.)tnet.hk/i", request()->server('HTTP_HOST'))||
                preg_match("/www(\.t\.|\.l\.|\.)eranet.com/i", request()->server('HTTP_HOST'))){
                $return="paypal.success.php";
                $cancel_return="paypal.error.net";
            }
            $p = [
                'userid' => $param['user_id'],
                'IDAPayment' => $param['IDAPayment'],
                'posturl' => $url,
                'business' => $business,
                'cmd' => '_xclick',
                'image_url' => 'url/logo.gif',
                'return' => $prefixUrl . $return,
                'cancel_return' => $prefixUrl . $cancel_return,
                'notify_url' => $prefixUrl . $return,
                'custom' => md5(DIRBASE . $business . $total_fee . $out_trade_no . strtoupper($currency)),
                'rm' => '2',
                'currency_code' => strtoupper($currency),
                'lc' => "US",
                'bn' => "toolkit-php",
                'cbt' => "Continue >>",
                'no_shipping' => "1",
                'no_note' => "1",
                'cn' => "Comments",
                'cs' => "",
                'item_name' => "",
                'amount' => $total_fee,
                'quantity' => '1',
                'invoice' => $out_trade_no,
                'item_number' => $out_trade_no,
                'undefined_quantity' => '',
                'first_name' => '',
                'last_name' => '',
                'address1' => $user['adminContact']['Street'],
                'address2' => '',
                'city' => $user['adminContact']['City'],
                'state' => $user['adminContact']['SP'],
                'zip' => $user['adminContact']['PC'],
                'email' => $user['adminContact']['Email'],
                'night_phone_a' => $user['adminContact']['Tel'],
                'night_phone_b' => '',
                'night_phone_c' => '',
            ];
            $str = "<form id='myform1' method='post' action='{$url}' target='_blank' >";
            foreach ($p as $key => $value) {
                $str .= "<input type='hidden' name='{$key}' value='{$value}'/>";
            }
            $str .= '</form>';
            return ['content' => $str, 'Type' => 'form'];
        }
    
    
    public function TransactionSearch($out_trade_no, $created_at, $conf)
    {
        $p = [
            'USER' => $conf['apiUsrename'],
            'PWD' => $conf['apiPassword'],
            'SIGNATURE' => $conf['signature'],
            'VERSION' => '3.2',
            'INVNUM' => $out_trade_no,
            'METHOD' => "TransactionSearch",
//                'CURRENCY'=>'',
            'STARTDATE' => date('Y-m-d\TH:i:s\Z', strtotime($created_at) - 3600 * 24 * 90),
            'ENDDATE' => date('Y-m-d\TH:i:s\Z'),
        ];
        $resp = $this->request("TransactionSearch", $p);
        return isset($resp['L_TRANSACTIONID0']) ? $resp : false;
    }
}

```
