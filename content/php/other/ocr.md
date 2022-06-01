---
title: "Ocr"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

图片识别,百度开放平台每天有一定的免费额度  
OcrBaiduClient.php
```php
class OcrBaiduClient implements OcrClientInterface
{
    use ApiConfigTrait;
    use ApiLoggerTrait;
    const API_NAME = "Baidu";
    private $client;
    private $redis;

    public function __construct()
    {
        $this->loadApiConfig(self::API_NAME);
        $this->client = new GuzzleHttp\Client([
            'timeout' => 120.0,
        ]);
        $this->redis = Redis::connection('default');
        $this->redis->select(3);

    }

    /**
     * 身份证识别
     * @param $id_card_side string 正反面 -front：身份证含照片的一面 -back：身份证带国徽的一面
     * @param string $image string 图像数据
     * @param string $url string 图片完整URL
     * @param array $param
     * @return mixed
     */
    public function OcrIdcard($id_card_side, $image = "", $url = "", $param = [])
    {
        $p = ['id_card_side' => $id_card_side];
        if ($image) {
            $p['image'] = $image;
        } elseif ($url) {
            $p['url'] = $url;
        }
        $redisValue = $this->redis->get("Ocr:Baidu:Idcard");
        $redisDate = $this->redis->get("Ocr:Baidu:IdcardDate");
        if(!$redisDate||$redisDate!=date("Y-m-d")){
            $this->redis->set("Ocr:Baidu:IdcardDate", date("Y-m-d"));
            $redisValue=0;
        }
        if($redisValue&&$redisValue>490) {
            return "api.count.limit";
        }
        $this->redis->set("Ocr:Baidu:Idcard", $redisValue?$redisValue+1:1);
        $resp = $this->request("/rest/2.0/ocr/v1/idcard", $p);
        if(isset($resp["error_msg"])){
            return $resp["error_msg"];
        }
        $data= [
          'name'=>$resp["words_result"]["姓名"]?$resp["words_result"]["姓名"]['words']:"",
          'nation'=>$resp["words_result"]["民族"]?$resp["words_result"]["民族"]['words']:"",
          'address'=>$resp["words_result"]["住址"]?$resp["words_result"]["住址"]['words']:"",
          'idnumber'=>$resp["words_result"]["公民身份号码"]?$resp["words_result"]["公民身份号码"]['words']:"",
          'birthday'=>$resp["words_result"]["出生"]?$resp["words_result"]["出生"]['words']:"",
          'sex'=>$resp["words_result"]["性别"]?$resp["words_result"]["性别"]['words']:"",
        ];
        if(!$data['idnumber']) return "idnumber.empty";
        return $data;
    }

    /**
     * 营业执照识别
     * @param string $image
     * @param string $url
     * @param array $param
     * @return mixed
     */
    public function OcrBusinessLicense($image = "", $url = "", $param = [])
    {
        $p = [
        ];
        if ($image) {
            $p['image'] =$image;
        } elseif ($url) {
            $p['url'] = $url;
        }
        $redisValue = $this->redis->get("Ocr:Baidu:BusinessLicense");
        $redisDate = $this->redis->get("Ocr:Baidu:BusinessLicenseDate");
        if(!$redisDate||$redisDate!=date("Y-m-d")){
            $this->redis->set("Ocr:Baidu:BusinessLicenseDate", date("Y-m-d"));
            $redisValue=0;
        }
        if($redisValue&&$redisValue>190){
            return "api.count.limit";
        }
        $this->redis->set("Ocr:Baidu:BusinessLicense", $redisValue?$redisValue+1:1);
        $resp = $this->request("/rest/2.0/ocr/v1/business_license", $p);
        if(isset($resp["error_msg"])){
            return $resp["error_msg"];
        }
        $data=[
          'reg_num'=>$resp["words_result"]["社会信用代码"]?$resp["words_result"]["社会信用代码"]['words']:"", //注册号
          'name'=>$resp["words_result"]["单位名称"]?$resp["words_result"]["单位名称"]['words']:"", //公司名称
          'type'=>$resp["words_result"]["类型"]?$resp["words_result"]["类型"]['words']:"", //公司类型
          'person'=>$resp["words_result"]["法人"]?$resp["words_result"]["法人"]['words']:"", //公司法人
          'establish_date'=>$resp["words_result"]["成立日期"]?$resp["words_result"]["成立日期"]['words']:"", //公司注册日期
          'valid_period'=>$resp["words_result"]["有效期"]?$resp["words_result"]["有效期"]['words']:"", //公司营业期限终止日期
          'address'=>$resp["words_result"]["地址"]?$resp["words_result"]["地址"]['words']:"", //公司地址
          'capital'=>$resp["words_result"]["注册资本"]?$resp["words_result"]["注册资本"]['words']:"", //注册资本
          'business'=>$resp["words_result"]["经营范围"]?$resp["words_result"]["经营范围"]['words']:"", //经营范围
        ];

        if(!$data['reg_num']){
            return "reg_num.empty";
        }
        $data['establish_date']=str_replace(["年","月"],"-",$data['establish_date']);
        $data['establish_date']=str_replace(["日"],"",$data['establish_date']);
        $data['valid_period']=str_replace(["年","月"],"-",$data['valid_period']);
        $data['valid_period']=str_replace(["日"],"",$data['valid_period']);
        return $data;
    }

    public function object_detect($image){
        $p=[
            'image'=>$image,
            'with_face'=>0
        ];
        return $this->request("rest/2.0/image-classify/v1/object_detect",$p);
    }


    public function getToken()
    {
        $filename = TMISBASE . '/data/baidu_access_token.json';
        if (file_exists($filename)) {
            $content = file_get_contents($filename);
            if ($content) {
                $json = json_decode($content, 1);
                if (strtotime($json['expires_in']) > time()) {
                    return $json['access_token'];
                }
            }
        }
        $resp = json_decode($this->client->request("POST", "https://aip.baidubce.com/oauth/2.0/token", [
            'form_params' => [
                'grant_type' => 'client_credentials',
                'client_id' => $this->apiConfig->ExtraConfig['access_key'],
                'client_secret' => $this->apiConfig->ExtraConfig['secret_key'],
            ]
        ])->getBody()->getContents(), 1);
        $data = [
            'access_token' => $resp['access_token'],
            'expires_in' => date("Y-m-d H:i:s", strtotime("+29 day")),
        ];
        file_put_contents($filename, json_encode($data, JSON_UNESCAPED_UNICODE));
        return $resp['access_token'];
    }




    private function request($action, $p)
    {

        $resp = $this->client->request("POST", "{$this->apiConfig->ExtraConfig['api_url']}/{$action}", [
            'query' => [
                'access_token' => $this->getToken(),
            ],
            'form_params' => $p
        ])
            ->getBody()
            ->getContents();
        return json_decode($resp, 1);
    }
    
    ```