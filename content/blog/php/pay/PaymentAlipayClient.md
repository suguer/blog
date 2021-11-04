---
title: "PaymentWechatClient"
date: 2021-10-31T10:08:33+08:00
weight: 3
---

```php
class PaymentAlipayClient implements PaymentClientInterface
{

  /* @var GuzzleHttp\Client* */
    private $client;
    
     const API_NAME = "Alipay";

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
            $p = [
                'service' => $this->is_mobile_request()?'alipay.wap.create.direct.pay.by.user':"create_direct_pay_by_user",
                'partner' => $this->apiConfig->ExtraConfig['partner'],
                'return_url' => (isset($_SERVER['REQUEST_SCHEME']) && $_SERVER['REQUEST_SCHEME'] ? $_SERVER['REQUEST_SCHEME'] : request()->server('REQUEST_SCHEME')) . "://" . MAINSITE . "/payment/alipay_return_url.php",
                'notify_url' => (isset($_SERVER['REQUEST_SCHEME']) && $_SERVER['REQUEST_SCHEME'] ? $_SERVER['REQUEST_SCHEME'] : request()->server('REQUEST_SCHEME')) . "://" . MAINSITE . "/payment/alipay_notify_url.php",
                '_input_charset'=>'utf-8',
                'subject'=>'网上汇入',
                'body'=>'网上汇入',
                'out_trade_no'=>$out_trade_no,
                'total_fee'=>$total_fee,
                'payment_type'=>1,
                'show_url'=>(isset($_SERVER['REQUEST_SCHEME']) && $_SERVER['REQUEST_SCHEME'] ? $_SERVER['REQUEST_SCHEME'] : request()->server('REQUEST_SCHEME'))."://".MAINSITE,
                'seller_email'=>$this->apiConfig->ExtraConfig['seller_email'],
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
        
        
          function is_mobile_request()
            {
                $_SERVER['ALL_HTTP'] = isset($_SERVER['ALL_HTTP']) ? $_SERVER['ALL_HTTP'] : '';
                $mobile_browser = '0';
                if(isset($_SERVER['HTTP_USER_AGENT'])&&preg_match('/(up.browser|up.link|mmp|symbian|smartphone|midp|wap|phone|iphone|ipad|ipod|android|xoom)/i', strtolower($_SERVER['HTTP_USER_AGENT'])))
                    $mobile_browser++;
                if((isset($_SERVER['HTTP_ACCEPT'])) and (strpos(strtolower($_SERVER['HTTP_ACCEPT']),'application/vnd.wap.xhtml+xml') !== false))
                    $mobile_browser++;
                if(isset($_SERVER['HTTP_X_WAP_PROFILE']))
                    $mobile_browser++;
                if(isset($_SERVER['HTTP_PROFILE']))
                    $mobile_browser++;
                if(isset($_SERVER['HTTP_USER_AGENT'])) {
                    $mobile_ua = strtolower(substr($_SERVER['HTTP_USER_AGENT'], 0, 4));
                    $mobile_agents = array(
                        'w3c ', 'acs-', 'alav', 'alca', 'amoi', 'audi', 'avan', 'benq', 'bird', 'blac',
                        'blaz', 'brew', 'cell', 'cldc', 'cmd-', 'dang', 'doco', 'eric', 'hipt', 'inno',
                        'ipaq', 'java', 'jigs', 'kddi', 'keji', 'leno', 'lg-c', 'lg-d', 'lg-g', 'lge-',
                        'maui', 'maxo', 'midp', 'mits', 'mmef', 'mobi', 'mot-', 'moto', 'mwbp', 'nec-',
                        'newt', 'noki', 'oper', 'palm', 'pana', 'pant', 'phil', 'play', 'port', 'prox',
                        'qwap', 'sage', 'sams', 'sany', 'sch-', 'sec-', 'send', 'seri', 'sgh-', 'shar',
                        'sie-', 'siem', 'smal', 'smar', 'sony', 'sph-', 'symb', 't-mo', 'teli', 'tim-',
                        'tosh', 'tsm-', 'upg1', 'upsi', 'vk-v', 'voda', 'wap-', 'wapa', 'wapi', 'wapp',
                        'wapr', 'webc', 'winw', 'winw', 'xda', 'xda-'
                    );
                    if(in_array($mobile_ua, $mobile_agents))
                        $mobile_browser++;
                }
                if(strpos(strtolower($_SERVER['ALL_HTTP']), 'operamini') !== false)
                    $mobile_browser++;
                // Pre-final check to reset everything if the user is on Windows
                if( isset($_SERVER['HTTP_USER_AGENT'])&&strpos(strtolower($_SERVER['HTTP_USER_AGENT']), 'windows') !== false)
                    $mobile_browser=0;
                // But WP7 is also Windows, with a slightly different characteristic
                if(isset($_SERVER['HTTP_USER_AGENT'])&&strpos(strtolower($_SERVER['HTTP_USER_AGENT']), 'windows phone') !== false)
                    $mobile_browser++;
                if($mobile_browser>0)
                    return true;
                else
                    return false;
            }
}

```