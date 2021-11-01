---
title: "Keycloak"
date: 2021-10-31T10:08:33+08:00
weight: 1
---
[Keycloak](https://www.keycloak.org/)

### 1. create realm
用于对接不同网站的登录用户,隔离区域

### 2. how to use
php
```php
composer require stevenmaguire/oauth2-keycloak
```

SsoKeycloakClient.php  

```
class SsoKeycloakClient implements SsoClientInterface
{
    use ApiConfigTrait;
    use ApiLoggerTrait;
    const API_NAME = "keycloak";

    private $server_access_token_path =  "/data/keycloak_server_access_token.log";

    /**
     * @var Keycloak
     */
    protected $provider;

    /**
     * @var GuzzleHttp\Client
     */
    private $client;


    public function __construct()
    {
        $this->initLogger(-3, 2);
        $this->loadApiConfig(self::API_NAME);
        try {
            $redirectUri = ShareSession::get('redirect_uri') ? ShareSession::get('redirect_uri') : $this->apiConfig->ExtraConfig['redirect_uri'];
        } catch (\Throwable $e) {
            $redirectUri = $this->apiConfig->ExtraConfig['redirect_uri'];
        }
        $redirectUri = $this->apiConfig->ExtraConfig['redirect_uri'];
        $this->provider = new Keycloak([
            'authServerUrl' => $this->apiConfig->Host,
            'realm' => $this->apiConfig->ExtraConfig['realm'],
            'clientId' => $this->apiConfig->ExtraConfig['login_client_id'],
            'clientSecret' => $this->apiConfig->ExtraConfig['login_client_secret'],
            'redirectUri' => $redirectUri,
        ]);
        $this->client = new GuzzleHttp\Client([
            'timeout' => 30.0,
        ]);
    }

    public function login()
    {

        $url = "{$this->apiConfig->Host}/realms/{$this->apiConfig->ExtraConfig['realm']}/protocol/openid-connect/auth";
        try {
            ShareSession::set("redirect_uri", $_SERVER['HTTP_REFERER']);
            $redirectUri = $_SERVER['HTTP_REFERER'];
        } catch (\Throwable $e) {
            $redirectUri = $this->apiConfig->ExtraConfig['redirect_uri'];
        }

        //http://www.taoa.com/user/login.php
        $redirectUri = $this->apiConfig->ExtraConfig['redirect_uri'];
        $p = [
            'client_id' => $this->apiConfig->ExtraConfig['login_client_id'],
//            'redirect_uri'=>$this->apiConfig->ExtraConfig['redirect_uri'],
            'redirect_uri' => $redirectUri,
            'state' => 'keycloak',
            'response_type' => 'code',
            'scope' => 'openid',
        ];
        return $url . "?" . http_build_query($p);
    }

    public function register()
    {

        $url = "{$this->apiConfig->Host}/realms/{$this->apiConfig->ExtraConfig['realm']}/protocol/openid-connect/registrations";
        try {
            ShareSession::set("redirect_uri", $_SERVER['HTTP_REFERER']);
            $redirectUri = $_SERVER['HTTP_REFERER'];
        } catch (\Throwable $e) {
            $redirectUri = $this->apiConfig->ExtraConfig['redirect_uri'];
        }

        //http://www.taoa.com/user/login.php
        $redirectUri = $this->apiConfig->ExtraConfig['redirect_uri'];
        $p = [
            'client_id' => $this->apiConfig->ExtraConfig['login_client_id'],
//            'redirect_uri'=>$this->apiConfig->ExtraConfig['redirect_uri'],
            'redirect_uri' => $redirectUri,
            'state' => 'keycloak',
            'response_type' => 'code',
            'scope' => 'openid',
        ];
        return $url . "?" . http_build_query($p);
    }

    public function logout($user_id)
    {
        $action = "/admin/realms/{realms}/users/{$user_id}/logout";
        $resp = $this->request($action, []);
        return !$resp ? true : $resp['errorMessage'];
    }


    public function create($param)
    {
        $p = [
            "enabled" => true,
            "attributes" => [
                'user_id' => [$param['user_id']]
            ],
            "username" => $param['Username'],
            "emailVerified" => true,
            'email' => $param['Email'],
            "credentials" => [[
                'temporary' => false,
                'type' => 'password',
                'value' => $param['Password'],
            ]],
        ];
        $resp = $this->request("/admin/realms/{realms}/users", $p);
        return !$resp ? true : (isset($resp['errorMessage']) ? $resp['errorMessage'] : $resp['error']);
    }

    public function authorization_code($code)
    {
        try {
            $token = $this->provider->getAccessToken('authorization_code', [
                'code' => $code
            ]);
            return $token;
        } catch (\Throwable $e) {
            return $e->getMessage();
        }
    }

    public function userinfo($param)
    {
        if (isset($param['token']) && $param['token']) {
            $token = new AccessToken([
                'access_token' => $param['token'],
            ]);
        } elseif (isset($param['code']) && $param['code']) {
            $token = $this->authorization_code($param['code']);
        }
        if (is_string($token)) {
            return $token;
        }
        $user = $this->provider->getResourceOwner($token);
        return $user;
    }

    public function UpdateUser($remote_user_id, $param = [])
    {
        $p = [];
        if (isset($param['user_id'])&&$param['user_id']) {
            $p["attributes"] = [
                'user_id' => [$param['user_id']]
            ];
        }
        if (isset($param['email'])&&$param['email']) {
            $p["email"] = $param['email'];
        }
        if (isset($param['username'])&&$param['username']) {
            $p["username"] = $param['username'];
        }
        $resp = $this->request("/admin/realms/{realms}/users/{$remote_user_id}", $p,"PUT");
        return !$resp ? true : (isset($resp['errorMessage']) ? $resp['errorMessage'] : $resp['error']);
    }

    public function access_token($param)
    {
        $token = $this->provider->getAccessToken('authorization_code', [
            'code' => $param['code']
        ]);
        return $token;
    }

    public function server_access_token()
    {
        if (file_exists($this->server_access_token_path) && file_get_contents($this->server_access_token_path)) {
            $json = json_decode(file_get_contents($this->server_access_token_path), true);
            if ($json['expires_in'] > date("Y-m-d H:i:s", strtotime("+ 60 seconds"))) {
                return $json;
            }
        }
        try {
            $resp = $this->client->request("POST", "{$this->apiConfig->Host}/realms/{$this->apiConfig->ExtraConfig['realm']}/protocol/openid-connect/token",
                [
                    'form_params' => [
                        'client_id' => $this->apiConfig->ExtraConfig['api_clietnt_id'],
                        'client_secret' => $this->apiConfig->ExtraConfig['api_client_secret'],
                        'grant_type' => 'client_credentials',
                    ],
                ])->getBody()->getContents();
            $resp = json_decode($resp, true);
            file_put_contents($this->server_access_token_path, json_encode([
                'access_token' => $resp['access_token'],
                'expires_in' => date("Y-m-d H:i:s", strtotime("+ {$resp['expires_in']} seconds"))
            ]));
            return ['access_token' => $resp['access_token'],];
        } catch (\Throwable $e) {
            return $e->getMessage();
        }
    }

    public function request($action, $param,$method="POST")
    {

        $action = str_replace("{realms}", $this->apiConfig->ExtraConfig['realm'], $action);
        $server_access_token = $this->server_access_token();
        if (is_string($server_access_token)) {
            return $server_access_token;
        }
        try {
            $resp = $this->client->request($method, "{$this->apiConfig->Host}{$action}", [
                'json' => $param,
                'headers' => [
                    'Authorization' => "Bearer {$server_access_token['access_token']}",
                ],
            ])->getBody()->getContents();
            return $resp ? json_decode($resp, 1) : $resp;
        } catch (GuzzleHttp\Exception\RequestException $e) {
            return json_decode($e->getResponse()->getBody()->getContents(), 1);
        } catch (\Throwable $e) {
            return ['errorMessage' => $e->getMessage()];
        }
    }
}
```