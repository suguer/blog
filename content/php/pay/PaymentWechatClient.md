---
title: "PaymentWechatClient"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

```php
class PaymentWechatClient implements PaymentClientInterface
{

  /* @var GuzzleHttp\Client* */
    private $client;
    const API_NAME = "wxpay";
    
        public function __construct()
        {
            $this->loadApiConfig(self::API_NAME);
            $this->client = new GuzzleHttp\Client([
                'timeout' => 30.0,
            ]);
        }
    
     /**
         * 查询支付结果
         * @return mixed
         */
        public function query($out_trade_no, $param = [])
        {
    
            $action = "/v3/pay/transactions/out-trade-no/{$out_trade_no}";
            $resp = $this->request($action, [], 'GET');
            return $resp;
        }


private function sign($url, $params, $method)
    {
        $params['mchid'] = $this->apiConfig->ExtraConfig['mch_id'];
        $serial_no = $this->apiConfig->ExtraConfig['serial_no'];
        $mch_private_key = file_get_contents("/conf/wechat_private_key.pem");
        ksort($params);
        $timestamp = time();
        $nonce = $this->getNonceStr(32);
        $body = ($method == "POST" ? json_encode($params, JSON_UNESCAPED_UNICODE) : "");

        $url_parts = parse_url($url);
        $canonical_url = $url_parts['path'] . ($method == "POST" ? "" : "?" . http_build_query($params));
        $message = $method . "\n" .
            $canonical_url . "\n" .
            $timestamp . "\n" .
            $nonce . "\n" .
            $body . "\n";

        openssl_sign($message, $raw_sign, $mch_private_key, 'sha256WithRSAEncryption');
        $sign = base64_encode($raw_sign);
        $token = sprintf('mchid="%s",nonce_str="%s",timestamp="%d",serial_no="%s",signature="%s"',
            $params['mchid'], $nonce, $timestamp, $serial_no, $sign);
        return ['query' => $params, 'token' => $token];
    }
    
    
    
    /**
     * @param $action
     * @param $params
     * @return mixed
     * @throws GuzzleHttp\Exception\GuzzleException
     */
    private function request($action, $params, $method = "POST")
    {
        $url = $this->apiConfig->Host . $action;
        $data = $this->sign($url, $params, $method);
        $option = [
            'verify' => false,
            'headers' => [
                'User-Agent' => 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR 3.0.04506.648; .NET CLR 3.5.21022)',
                'Accept' => '*/*',
                'Content-Type' => 'application/json',
                'Authorization' => "WECHATPAY2-SHA256-RSA2048 {$data['token']}",
            ],
            'http_errors' => false,
        ];
        if ($method == "GET") {
            $option['query'] = $data['query'];
        } else {
            $option['body'] = json_encode($data['query'], JSON_UNESCAPED_UNICODE);
        }
        try {
            $request = $this->client->request($method,
                $url,
                $option
            )
                ->getBody()
                ->getContents();
            return json_decode($request, 1);
        } catch (GuzzleHttp\Exception\GuzzleException $e) {
            return ['error' => $e->getMessage()];
        } catch (\Throwable $e) {
            return ['error'=>$e->getMessage()] ;
        }

    }
    
     /**
         *
         * 产生随机字符串，不长于32位
         * @param int $length
         * @return string 产生的随机字符串
         */
        public function getNonceStr($length = 32)
        {
            $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            $str = "";
            for ($i = 0; $i < $length; $i++) {
                $str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
            }
            return $str;
        }


    /**
     * 支付请求
     * @param $order_out_no
     * @param $total_fee
     * @param array $param
     * @return mixed
     */
    public function jsapi($out_trade_no, $total_fee, $param = [])
    {
        $action = "/v3/pay/transactions/jsapi";
        $p = [
            'appid' => $this->apiConfig->ExtraConfig['appid'],
            'description' => '充值',
            'out_trade_no' => $out_trade_no,
            'amount' => [
                'total' => $total_fee * 100,
                'currency' => 'CNY',
            ],
            'notify_url' => (isset($_SERVER['REQUEST_SCHEME']) && $_SERVER['REQUEST_SCHEME'] ? $_SERVER['REQUEST_SCHEME'] : request()->server('REQUEST_SCHEME')) . "://" . MAINSITE . "/payment/wxpay_notify_v3.php",
//            'notify_url' =>  "http://" . MAINSITE . "/payment/wxpay_notify_v3.php",
            'payer' => [
                'openid' => $param['openid'],
            ],
        ];
        $resp = $this->request($action, $p);
        if (isset($resp['code'])) return $resp['message'];
        $data = [
            'appId' => $this->apiConfig->ExtraConfig['appid'],
            'timeStamp' => strval(time()),
            'nonceStr' => DomainUtil::generateDomainPassword(24, false),
            'package' => "prepay_id={$resp['prepay_id']}",
        ];

        $message="{$data['appId']}\n{$data['timeStamp']}\n{$data['nonceStr']}\n{$data['package']}\n";
        openssl_sign($message,
            $raw_sign,
            file_get_contents(WWWBASE . "/conf/global/wechat_private_key.pem"),
            'sha256WithRSAEncryption');

        $data['paySign'] = base64_encode($raw_sign);
        $data['openid']=$param['openid'];
        $data['signType']='RSA';
        return ['content'=>$data,'Type'=>'JSAPI'];
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
            $action = "/v3/pay/transactions/native";
            $p = [
                'appid' => $this->apiConfig->ExtraConfig['appid'],
                'description' => '充值',
                'out_trade_no' => $out_trade_no,
                'amount' => [
                    'total' => intval(strval(round($total_fee,2) * 100)),
                    'currency' => 'CNY',
                ],
                'notify_url' =>  "your website url",
            ];
            $resp = $this->request($action, $p);
            if (isset($resp['error'])&&$resp['error']) return $resp['error'];
            if(isset($resp['message'])&&$resp['message']) return $resp['message'];
            return [
                'content' => $resp['code_url'],
                'QrcodeUrl' => $resp['code_url'],
                'Type' => 'qrcode_url'];
    
        }
    
    
    /**
     * 支付回调,由于各支付平台的参数都不同,因此返回原始信息自己处理
     * @param $all
     * @return mixed
     */
    public function handle($all)
    {
        // TODO: Implement handle() method.
    }
    
        public function decode($associatedData, $nonceStr, $ciphertext)
        {
            $ciphertext = base64_decode($ciphertext);
            if (strlen($ciphertext) <= self::AUTH_TAG_LENGTH_BYTE) {
                return false;
            }
            if (function_exists('\sodium_crypto_aead_aes256gcm_is_available') &&
                sodium_crypto_aead_aes256gcm_is_available()) {
                return sodium_crypto_aead_aes256gcm_decrypt($ciphertext, $associatedData, $nonceStr, $this->apiConfig->ExtraConfig['key']);
            }
    
            // ext-libsodium (need install libsodium-php 1.x via pecl)
            if (function_exists('\Sodium\crypto_aead_aes256gcm_is_available') &&
                \Sodium\crypto_aead_aes256gcm_is_available()) {
                return \Sodium\crypto_aead_aes256gcm_decrypt($ciphertext, $associatedData, $nonceStr, $this->apiConfig->ExtraConfig['key']);
            }
    
            // openssl (PHP >= 7.1 support AEAD)
            if (PHP_VERSION_ID >= 70100 && in_array('aes-256-gcm', \openssl_get_cipher_methods())) {
                $ctext = substr($ciphertext, 0, -self::AUTH_TAG_LENGTH_BYTE);
                $authTag = substr($ciphertext, -self::AUTH_TAG_LENGTH_BYTE);
    
                return \openssl_decrypt($ctext, 'aes-256-gcm', $this->apiConfig->ExtraConfig['key'], \OPENSSL_RAW_DATA, $nonceStr,
                    $authTag, $associatedData);
            }
            return false;
        }


    
}

```