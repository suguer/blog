---
title: "Tron"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

requirelib.txt  
```
pycryptodomex
base58
ecdsa
requests
```

for example : 轮询智能冻结能量

```python
# -*- coding: utf-8 -*-
from tronapi.tronapi import Tronapi
from tronapi import keys
from tronapi.cache import Cache
import time
import os.path
import energy_config
import requests
import datetime
import math
from tronapi import TRX
import json

logFilename = os.getcwd() + "/log/action.txt"
cache = Cache()
excute_unfreeze_address = False

def unfreeze_address(tronapi,is_need_unfreeze=False,need_unfreeze_count=0):
    excute_unfreeze_address=False
    try:
        now_unfreeze_count=0
        newJson = []
        if is_need_unfreeze is True:
            self_unfreeze = tronapi.unfreeze_balance()
            time.sleep(1)
            if not self_unfreeze.get('response').get("Error"):
                excute_unfreeze_address=True
            else:
                newJson.append({'address': energy_config.owner_address})
        else:
            newJson.append({'address': energy_config.owner_address})
        GetDelegatedResourceAccountIndex = tronapi.GetDelegatedResourceAccountIndex()
        array = GetDelegatedResourceAccountIndex['toAccounts']
        cache.append(logFilename, "[%s]:已冻结用户:%s 个" % (
            datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), len(array)), True)
        for address in array:
            GetDelegatedResource = tronapi.GetDelegatedResource(keys.to_base58check_address(address))
            time.sleep(1)
            if  (int(time.time() * 1000) > GetDelegatedResource['delegatedResource'][0]['expire_time_for_energy']):
                if is_need_unfreeze is True and now_unfreeze_count < need_unfreeze_count:
                    cache.append(logFilename,
                                 "[%s]:地址:%s 已解冻" % (datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                                     keys.to_base58check_address(address),), True)
                    tronapi.unfreeze_balance(receiver=keys.to_base58check_address(address))
                    time.sleep(1)
                    excute_unfreeze_address = True
                    now_unfreeze_count = now_unfreeze_count+1
                else:
                    newJson.append({'address': keys.to_base58check_address(address)})
            else:
                cache.append(logFilename,
                             "[%s]:地址:%s 解冻 %s" % (datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                                     keys.to_base58check_address(address),
                                                     time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(
                                                         GetDelegatedResource['delegatedResource'][0][
                                                             'expire_time_for_energy'] / 1000))
                                                     ), True)
                newJson.append({'address': keys.to_base58check_address(address)})
        return {'newJson': newJson, 'excute_unfreeze_address': excute_unfreeze_address}
    except Exception as r:
        return {'newJson':[],'excute_unfreeze_address':False}


# 获取当前需要冻结的实际钱包地址
def get_need_freeze_array():
    try:
        return []
    except Exception as r:
        return []


def get_min_trx(tronapi):
    account = tronapi.getaccount()
    account_balance = math.floor(account['balance'] / TRX) if 'balance' in account else 0
    time.sleep(1)
    getaccountnet = tronapi.getaccountresource()
    # 换算计算出当前最低需冻结的trx
    min_trx = 10 + math.ceil(
        energy_config.default_min_energy / (getaccountnet['TotalEnergyLimit'] / getaccountnet['TotalEnergyWeight']))
    tronPowerLimit = getaccountnet['tronPowerLimit'] if 'tronPowerLimit' in getaccountnet else 0
    cache.append(logFilename, "[%s]:总TRX %s,可用TRX %s,已冻结 %s,单次最低 %s" % (
        datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), tronPowerLimit + account_balance,
        account_balance, tronPowerLimit, min_trx), True)
    # 3天冻结期计算轮询触发的动态间隔时间 ,单位(秒)
    random_interval_second = (86400 * 3) / ((tronPowerLimit + account_balance) / min_trx)
    random_interval_second = math.ceil(random_interval_second) if random_interval_second > 0 else 60 * 30
    return {"min_trx":min_trx,"random_interval_second":random_interval_second}

cache.append(logFilename,
             "[%s]:版本V 2.3 优化解冻判断,根据有效钱包判断实际需要解冻的地址数量" % (datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),),
             True)

excute_date = cache.get(os.getcwd() + "/log/date.log")

tronapi = Tronapi(
    network=energy_config.environment,
    priv_key=energy_config.owner_key,
    owner=energy_config.owner_address
)
getaccountnet = tronapi.getaccountresource()
print(getaccountnet)
exit()

while True:
    resp=get_min_trx(tronapi)
    min_trx=resp['min_trx']
    random_interval_second=resp['random_interval_second']
    time.sleep(1)
    need_freeze_array = get_need_freeze_array()
    now_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    excute_date = cache.get(os.getcwd() + "/log/date.log")
    cache.append(logFilename, "[%s]:需冻结%s 个" % (now_time, len(need_freeze_array)), True)
    if excute_date is None or now_time > excute_date or len(need_freeze_array) > 0:
        isNeedvote = False
        newJsonResp = unfreeze_address(tronapi,is_need_unfreeze=True if len(need_freeze_array)>0 else False,need_unfreeze_count=len(need_freeze_array))
        newJson=newJsonResp['newJson']
        excute_unfreeze_address=newJsonResp['excute_unfreeze_address']
        time.sleep(1)
        getaccountnet = tronapi.getaccountresource()
        tronPowerLimit = getaccountnet['tronPowerLimit'] if 'tronPowerLimit' in getaccountnet else 0
        time.sleep(1)
        account = tronapi.getaccount()
        account_balance = math.floor(account['balance'] / TRX) if 'balance' in account else 0

        if tronPowerLimit > 0 and (len(newJson) == 0 or len(newJson) != tronPowerLimit / min_trx):
            newJson.append({'address': energy_config.owner_address})
        cache.append(logFilename, "[%s]:总TRX%s,可用TRX%s,已冻结%s" % (
            datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), tronPowerLimit + account_balance, account_balance,
            tronPowerLimit), True)
        # 当前剩余trx最多可以冻结几份能量
        balanceLoop = math.floor(account_balance / min_trx)
        next_time = (datetime.datetime.now() + datetime.timedelta(seconds=random_interval_second)).strftime(
            "%Y-%m-%d %H:%M:%S")
        if account_balance == 0 or balanceLoop == 0:
            cache.append(logFilename, "[%s]:当前TRX不足 %s" % (now_time, account_balance),
                         True)
        elif len(need_freeze_array) == 0 and account_balance <= energy_config.keep_trx_count * min_trx:
            cache.append(logFilename, "[%s]:暂无有效钱包,保留TRX %s" % (now_time, energy_config.keep_trx_count * min_trx),
                         True)
        else:
            address_array = [(item.get('address')) for n, item in enumerate(newJson)]
            for i in range(balanceLoop):
                is_break_flag = False
                # 优先冻结有效地址
                if len(need_freeze_array) > 0:
                    target = need_freeze_array.pop()
                    if target['address'] not in address_array:
                        freeze_resp = tronapi.freeze_balance(amount=min_trx, receiver=target['address'])
                        if freeze_resp.get('response').get("Error"):
                            cache.append(logFilename,
                                         "[%s]:有效地址 %s,冻结失败%s" % (
                                             now_time, target['address'], freeze_resp.get('response').get("Error")),
                                         True)
                        else:
                            isNeedvote = True
                            cache.append(logFilename,
                                         "[%s]:有效地址 %s,冻结能量%s" % (
                                             now_time, target['address'], min_trx),
                                         True)
                            newJson.append({"address": target['address']})
                    time.sleep(5)
                    if len(need_freeze_array) == 0:
                        is_break_flag = True
                else:
                    for random_address in energy_config.random_address_array:
                        flag = False
                        for new in newJson:
                            if (new['address'] == random_address):
                                flag = True
                                break
                        if flag is False:
                            freeze_resp = tronapi.freeze_balance(amount=min_trx, receiver=random_address)
                            if freeze_resp.get('response').get("Error"):
                                cache.append(logFilename,
                                             "[%s]:随机地址%s,冻结失败返回%s" % (
                                                 now_time, random_address,
                                                 freeze_resp.get('response').get("Error")),
                                             True)
                            else:
                                isNeedvote = True
                                newJson.append({"address": random_address})
                                cache.append(logFilename,
                                             "[%s]:随机地址%s,冻结能量%s" % (
                                                 now_time, random_address, min_trx),
                                             True)
                                time.sleep(10)
                                is_break_flag = True
                            break

                if is_break_flag is True:
                    break
            cache.set(os.getcwd() + "/log/date.log", next_time)
        getaccountnet = tronapi.getaccountresource()
        tronPowerLimit = getaccountnet['tronPowerLimit'] if 'tronPowerLimit' in getaccountnet else 0
        if (tronPowerLimit > 0 and isNeedvote is True) or excute_unfreeze_address is True :
            vote_witness_account_resp = tronapi.vote_witness_account(
                vote_count=tronPowerLimit,
                vote_address=energy_config.vote_address)
            cache.append(logFilename,
                         "[%s]:已冻结 %s,投票 %s" % (
                             now_time, tronPowerLimit, energy_config.vote_address),
                         True)
        cache.append(logFilename,
                     "[%s]:执行结束,下次执行 %s" % (datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), next_time), True)
        time.sleep(60 * 30)
    else:
        time.sleep(60 * 30)
```