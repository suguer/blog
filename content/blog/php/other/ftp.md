---
title: "Ftp"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

批量从A主机的ftp数据迁移到B主机上


```php
<?php
set_time_limit(0);
ini_set('date.timezone', 'Asia/Shanghai');
ini_set('memory_limit', '2048M');
const BT_KEY = "";  //接口密钥
const BT_PANEL = "";       //面板地址
const NewHost = '';
class bt_api
{
    private $BT_KEY = BT_KEY;  //接口密钥
    private $BT_PANEL = BT_PANEL;       //面板地址

    //如果希望多台面板，可以在实例化对象时，将面板地址与密钥传入
    public function __construct($bt_panel = null, $bt_key = null)
    {
        if ($bt_panel) $this->BT_PANEL = $bt_panel;
        if ($bt_key) $this->BT_KEY = $bt_key;
    }

    //示例取面板日志
    public function GetLogs()
    {
        //拼接URL地址
        $url = $this->BT_PANEL . '/data?action=getData';

        //准备POST数据
        $p_data = $this->GetKeyData();        //取签名
        $p_data['table'] = 'logs';
        $p_data['limit'] = 10;
        $p_data['tojs'] = 'test';

        //请求面板接口
        $result = $this->HttpPostCookie($url, $p_data);

        //解析JSON数据
        $data = json_decode($result, true);
        return $data;
    }

    //示例取面板日志
    public function getSitesData()
    {
        //拼接URL地址
        $url = $this->BT_PANEL . '/data?action=getData';

        //准备POST数据
        $p_data = $this->GetKeyData();        //取签名
        $p_data['table'] = 'sites';
        $p_data['limit'] = 200;
        $p_data['p'] = 1;
        $p_data['type'] = '-1';

        //请求面板接口
        $result = $this->HttpPostCookie($url, $p_data);

        //解析JSON数据
        $data = json_decode($result, true);
        return $data;
    }

    //示例取面板日志
    public function getFtpsData($ftpname = "")
    {
        //拼接URL地址
        $url = $this->BT_PANEL . '/data?action=getData';

        //准备POST数据
        $p_data = $this->GetKeyData();        //取签名
        $p_data['table'] = 'ftps';
        $p_data['limit'] = 200;
        $p_data['p'] = 1;
        if ($ftpname) {
            $p_data['search'] = $ftpname;
        }

        //请求面板接口
        $result = $this->HttpPostCookie($url, $p_data);

        //解析JSON数据
        $data = json_decode($result, true);
        return $data;
    }


    /**
     * 构造带有签名的关联数组
     */
    private function GetKeyData()
    {
        $now_time = time();
        $p_data = array(
            'request_token' => md5($now_time . '' . md5($this->BT_KEY)),
            'request_time' => $now_time
        );
        return $p_data;
    }


    /**
     * 发起POST请求
     * @param String $url 目标网填，带http://
     * @param Array|String $data 欲提交的数据
     * @return string
     */
    private function HttpPostCookie($url, $data, $timeout = 60)
    {
        //定义cookie保存位置
        $cookie_file = './' . md5($this->BT_PANEL) . '.cookie';
        if (!file_exists($cookie_file)) {
            $fp = fopen($cookie_file, 'w+');
            fclose($fp);
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file);
        curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $output = curl_exec($ch);
        curl_close($ch);
        return $output;
    }
}

$ftpname = isset($argv[1]) && $argv[1] ? $argv[1] : "";
file_put_contents(__DIR__ . "/data/log.txt", "");
$api = new bt_api();
$data = $api->getFtpsData($ftpname);

foreach ($data['data'] as $index => $item) {
    $download_file_array = [];
    $upload_file_array = [];
    $download_file_count = 0;
    $upload_file_count = 0;
    $ftp_config = [
        'host' => NewHost,
        'user' => trim($item['name']),
        'pwd' => trim($item['password']),
    ];
    $log = "[" . date("Y-m-d H:i:s") . "]:{$ftp_config['user']}";
    $ftp_conn_id = ftp_connect($ftp_config['host'], 21, 60000);
    $is_login = ftp_login($ftp_conn_id, $ftp_config['user'], $ftp_config['pwd']); //登陆  -- 屏蔽警告了
    if (!$is_login) {
        sleep(5);
        @ftp_close($ftp_conn_id);
        $ftp_conn_id = ftp_connect($ftp_config['host'], 21, 60000);
        $is_login = ftp_login($ftp_conn_id, $ftp_config['user'], $ftp_config['pwd']); //登陆  -- 屏蔽警告了
        if (!$is_login) {
            file_put_contents(__DIR__ . "/data/log.txt", $log . " 连接失败\n" . PHP_EOL, FILE_APPEND);
            continue;
        }
    }
    ftp_pasv($ftp_conn_id, true);
    UploadFtp($ftp_config, "D:/freehost/{$ftp_config['user']}/web", "", $ftp_conn_id);
    $log .= ";上传:{$upload_file_count}\n";
    ftp_close($ftp_conn_id);
    $result = [
        $ftp_config['user'],
        "上传文件数:{$upload_file_count}",
    ];
    if (!empty($download_file_array)) {
        $result[] = "下载失败:";
        foreach ($download_file_array as $file) {
            $result[] = $file;
        }
        $log .= "下载" . implode(";", $download_file_array) . "\n";
    }

    if (!empty($upload_file_array)) {
        $result[] = "上传失败:";
        foreach ($upload_file_array as $file) {
            $result[] = $file;
        }
        $log .= "上传" . implode(";", $upload_file_array) . "\n";
    }
    file_put_contents(__DIR__ . "/data/{$ftp_config['user']}.txt", implode("\n", $result));
    file_put_contents(__DIR__ . "/data/log.txt", $log . PHP_EOL, FILE_APPEND);
    sleep(1);
}


function UploadFtp($new_ftp_config, $localpath = "/", $serverpath = "/", $ftp_conn_id)
{
    global $upload_file_array, $upload_file_count;
    $dir = scandir($localpath);
    foreach ($dir as $key => $value) {
        if (in_array($value, [".", ".."])) continue;
        $result = strrpos($value, ".");
        $filesize = filesize("{$localpath}/{$value}");
        if ($result&&$filesize) {
            try {
                ftp_mkdir($ftp_conn_id, $serverpath);
            } catch (\Throwable $e) {
                var_dump($e->getMessage());
            }
            $date = date("Y-m-d H:i:s");
            $size = ftp_size($ftp_conn_id, "{$serverpath}/{$value}");
            $upload_file_count++;
            echo "[{$date}]:{$serverpath}/{$value}   size:{$size}, local:{$filesize} \n";

            if ($size > 0) {
                //echo   "not-need \n";
            } else {
                $resp = ftp_put($ftp_conn_id, "{$serverpath}/{$value}", "{$localpath}/{$value}", FTP_BINARY, 0);

                if (!$resp) {
                    //可能超时了,重连一下试试
                    @ftp_close($ftp_conn_id);
                    $ftp_conn_id = ftp_connect($new_ftp_config['host'], 21, 6000);
                    ftp_login($ftp_conn_id, $new_ftp_config['user'], $new_ftp_config['pwd']); //登陆  -- 屏蔽警告了
                    ftp_pasv($ftp_conn_id, true);
                    $resp = ftp_put($ftp_conn_id, "{$serverpath}/{$value}", "{$localpath}/{$value}", FTP_BINARY, 0);
                }
                if (!$resp) $upload_file_array[] = "{$localpath}/{$value}";
//                echo "{$serverpath}/{$value}\n";
//                echo "{$localpath}/{$value}\n";
                echo ($resp ? "success" : "error") . " \n";
            }
        } else {
            $local_path = $localpath . "/" . $value;
            $server_path = $serverpath . "/" . $value;
            UploadFtp($new_ftp_config, $local_path, $server_path, $ftp_conn_id);
        }
    }
}

```