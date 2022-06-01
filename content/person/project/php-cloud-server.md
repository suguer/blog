---
title: "三方云市场模块"
date: 2022-05-31T11:02:00+08:00
---  

云主机一般涉及到以下功能
```shell
interface ClientInterface
{
    /**
     * 开机
     * @return mixed
     */
    public function StartInstance($ecs);
    
    /**
     * 关机
     * @return mixed
     */
    public function StopInstance($ecs, $ForceStop = false);
    
    /**
     * 重启
     * @return mixed
     */
    public function RebootInstance($ecs);
    
    
    /**
     * 修改密码
     * @param $ecs
     * @param $password
     * @return mixed
     */
    public function ModifyInstancePasswd($ecs, $password);
    
    
    /**
     * 查询续费价格,远端或者自己配置文件计算的原始价格
     * @param $ecs
     * @param $Period
     * @param $PeriodUnit
     * @return mixed
     */
    public function DescribeRenewPrice($ecs, $Period, $PeriodUnit);
    
     /**
     * 续费实例
     * @param $ecs
     * @param $Period
     * @param $PeriodUnit
     * @return mixed
     */
    public function RenewInstance($ecs, $Period, $PeriodUnit);
    
    
    /**
     * 查询购买价格,远端或者自己配置文件计算的原始价格
     * @param $ecs
     * @param $Period 时限
     * @param $PeriodUnit year 年, month 月, day 日
     * @return mixed
     */
    public function DescribePrice($ecs, $Period, $PeriodUnit);
    
     /**
     * 创建实例
     * @param $ecs
     * @param $Period
     * @param $PeriodUnit
     * @param bool $DryRun
     * @return mixed
     */
    public function CreateInstance($ecs, $Period, $PeriodUnit);
    
    
     /**
     * 发送检查请求，不会创建实例。检查项包括是否填写了必需参数、请求格式、业务限制和ECS库存。如果检查不通过，则返回对应错误。
     * @param $ecs
     * @param $Period
     * @param $PeriodUnit
     * @return mixed
     */
    public function CreateInstanceDryRun($ecs, $Period, $PeriodUnit);
    
    
    /**
     * 获取远程连接的系统或者平台的链接,
     * @param $ecs
     * @return mixed
     */
    public function DescribeInstanceVncUrl($ecs);
    
    
     /**
     * 获取所有地域
     * @return mixed
     */
    public function DescribeRegions();
    
    
      /**
     * 查询升级和降配实例规格或者系统盘时，某一可用区的可用资源信息。
     * @param $ecs
     * @param $OperationType String 配置的操作类型
     * @return mixed
     */
    public function DescribeResourcesModification($ecs, $OperationType);
    
    
    /**
     * 查询升级价格,远端或者自己配置文件计算的原始价格
     * @param $ecs
     * @param $Period
     * @param $PeriodUnit
     * @return mixed
     */
    public function DescribeUpgradePrice($ecs);
    
    
    /**
    * 升级实例
    */
    public function UpgradeInstance($ecs);
    
    
     /**
     * 设置预付费实例的自动续费状态。为了减少您的资源到期维护成本，包年包月 ECS 实例可以设置自动续费。
     * @param $ecs
     * @param $AutoRenew boolean
     * @param int $Period
     * @param string $PeriodUnit
     * @return mixed
     */
    public function ModifyInstanceAutoRenewAttribute($ecs, $AutoRenew, $Period = 1, $PeriodUnit = 'month');
}
```
其他功能例如防火墙,快照等则根据需求看是否要另行增加,以上支持需要用到的基础接口  
注意磁盘和主机状态,不同云厂商的规则定义是不同的,建议自行定义规范化




