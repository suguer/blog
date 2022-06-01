---
title: "Api"
date: 2021-10-31T10:08:33+08:00
weight: 2
---
\_\_init__.py  
```python
TRX = 1_000_000
SUN = 1
```

tronapi.py  
```python
from tronapi import keys
from tronapi.keys import PrivateKey
from tronapi.defaults import conf_for_name
import requests
import json
from tronapi import TRX

DEFAULT_CONF = {
    'fee_limit': 10_000_000,
    'timeout': 10.0,  # in second
}


class Tronapi(object):
    conf = {
        'fee_limit': 10_000_000,
        'timeout': 10_000_000,
        'fullnode': "https://api.trongrid.io",
    }
    network = ""

    def __init__(self, network: str = "mainnet", priv_key: str = None, owner: str = None):
        self.conf = DEFAULT_CONF
        self.conf['fullnode'] = conf_for_name(network)['fullnode']
        if priv_key is not None:
            self.priv_key = PrivateKey(bytes.fromhex(priv_key))
        if owner is not None:
            self.owner = owner
        # print(conf_for_name(network))

    # 冻结 文档 https://cn.developers.tron.network/reference#%E5%86%BB%E7%BB%93%E8%B4%A6%E6%88%B7
    def freeze_balance(self, owner: str = None, amount: int = 1, resource: str = "ENERGY", receiver: str = None):
        payload = {
            "frozen_balance": amount * TRX,
            "frozen_duration": 3,
            "resource": resource,
        }

        if owner is not None:
            payload["owner_address"] = keys.to_hex_address(owner)
        else:
            payload["owner_address"] = keys.to_hex_address(self.owner)

        if receiver is not None and keys.to_hex_address(receiver) != payload["owner_address"]:
            payload["receiver_address"] = keys.to_hex_address(receiver)
        response = self.build(action="/wallet/freezebalance", data=payload)
        return response

    # 解冻
    def unfreeze_balance(self, owner: str = None, resource: str = "ENERGY", receiver: str = None):
        payload = {
            "resource": resource,
        }

        if owner is not None:
            payload["owner_address"] = keys.to_hex_address(owner)
        else:
            payload["owner_address"] = keys.to_hex_address(self.owner)

        if receiver is not None:
            payload["receiver_address"] = keys.to_hex_address(receiver)
        response = self.build(action="/wallet/unfreezebalance", data=payload)
        return response

    # trx转账
    def sendTrx(self, owner: str= None, amount: int=0, receiver: str = None):
        payload = {
            "amount": amount * TRX,
            "to_address": keys.to_hex_address(receiver),
        }

        if owner is not None:
            payload["owner_address"] = keys.to_hex_address(owner)
        else:
            payload["owner_address"] = keys.to_hex_address(self.owner)

        response = self.build(action="/wallet/createtransaction", data=payload)
        return response

    # 投票
    def vote_witness_account(self, owner: str = None, vote_address: str = None,vote_count:int=1):
        payload = {
            "votes": [
                {
                    "vote_address": keys.to_hex_address(vote_address),
                    "vote_count": vote_count,
                }
            ]
        }
        if owner is not None:
            payload["owner_address"] = keys.to_hex_address(owner)
        else:
            payload["owner_address"] = keys.to_hex_address(self.owner)
        response = self.build(action="/wallet/votewitnessaccount", data=payload)
        return response

    # 获取账号 getaccount
    def getaccount(self, owner: str = None):
        payload = {
            "address": keys.to_hex_address(self.owner),
        }
        if owner is not None:
            payload["address"] = keys.to_hex_address(owner)
        response = self.request(action="/wallet/getaccount", data=payload)
        return response

    # 查看一个账户给哪些账户代理了资源.
    def GetDelegatedResourceAccountIndex(self, ):
        payload = {
            "value": keys.to_hex_address(self.owner),
        }
        response = self.request(action="/wallet/getdelegatedresourceaccountindex", data=payload)
        return response

    # 查看一个账户代理给另外一个账户的资源情况.
    def GetDelegatedResource(self, toAddress:str):
        payload = {
            "fromAddress": keys.to_hex_address(self.owner),
            'toAddress':keys.to_hex_address(toAddress),
        }
        response = self.request(action="/wallet/getdelegatedresource", data=payload)
        return response

    # GetAccountResource  查询账户的资源信息（带宽，能量）
    def getaccountresource(self,owner: str = None ):
        payload = {
            "address": keys.to_hex_address(self.owner),
        }
        if owner is not None:
            payload["address"] = keys.to_hex_address(owner)
        response = self.request(action="/wallet/getaccountresource", data=payload)
        return response

    def build(self, action: str, data: None):
        response = self.request(action, data=data)
        if response.get("Error"):
            return {'response': response}
        response = self.sign(response)
        broadcast = self.broadcast(response)
        return {'response': response, 'broadcast': broadcast}

    # 签名
    def sign(self, request: None):
        sig = self.priv_key.sign_msg_hash(bytes.fromhex(request['txID']))
        request['signature'] = sig.hex()
        return request

    # 广播
    def broadcast(self, request: None):
        return self.request(action="/wallet/broadcasttransaction", data=request)

    def request(self, action: str, data: None):
        response = requests.post(self.conf['fullnode'] + action, json=data)
        return response.json()

```

defaults.py
```python
CONF_MAINNET = {
    "fullnode": "https://api.trongrid.io",
    "event": "https://api.trongrid.io",
}

# The long running, maintained by the tron-us community
CONF_SHASTA = {
    "fullnode": "https://api.shasta.trongrid.io",
    "event": "https://api.shasta.trongrid.io",
    "faucet": "https://www.trongrid.io/faucet",
}

# Maintained by the official team
CONF_NILE = {
    "fullnode": "https://api.nileex.io",
    "event": "https://event.nileex.io",
    "faucet": "http://nileex.io/join/getJoinPage",
}

# Maintained by the official team
CONF_TRONEX = {
    "fullnode": "https://testhttpapi.tronex.io",
    "event": "https://testapi.tronex.io",
    "faucet": "http://testnet.tronex.io/join/getJoinPage",
}

ALL = {
    "mainnet": CONF_MAINNET,
    "nile": CONF_NILE,
    "shasta": CONF_SHASTA,
    "tronex": CONF_TRONEX,
}


def conf_for_name(name: str) -> dict:
    return ALL.get(name, None)

```
  
exceptions.py  
```python
CONF_MAINNET = {
    "fullnode": "https://api.trongrid.io",
    "event": "https://api.trongrid.io",
}

# The long running, maintained by the tron-us community
CONF_SHASTA = {
    "fullnode": "https://api.shasta.trongrid.io",
    "event": "https://api.shasta.trongrid.io",
    "faucet": "https://www.trongrid.io/faucet",
}

# Maintained by the official team
CONF_NILE = {
    "fullnode": "https://api.nileex.io",
    "event": "https://event.nileex.io",
    "faucet": "http://nileex.io/join/getJoinPage",
}

# Maintained by the official team
CONF_TRONEX = {
    "fullnode": "https://testhttpapi.tronex.io",
    "event": "https://testapi.tronex.io",
    "faucet": "http://testnet.tronex.io/join/getJoinPage",
}

ALL = {
    "mainnet": CONF_MAINNET,
    "nile": CONF_NILE,
    "shasta": CONF_SHASTA,
    "tronex": CONF_TRONEX,
}


def conf_for_name(name: str) -> dict:
    return ALL.get(name, None)

```

 
keys/\_\_init__.py  
```python
import ecdsa  # type: ignore
from Cryptodome.Hash import keccak
import hashlib
import base58
from collections.abc import ByteString, Hashable
import random
from typing import Any, Union
from tronapi.exceptions import BadKey, BadSignature, BadAddress


def keccak256(data: bytes) -> bytes:
    hasher = keccak.new(digest_bits=256)
    hasher.update(data)
    return hasher.digest()


def sha256(data: bytes) -> bytes:
    hasher = hashlib.sha256()
    hasher.update(data)
    return hasher.digest()


def public_key_to_base58check_addr(pub_key: bytes) -> str:
    primitive_addr = b"\x41" + keccak256(pub_key)[-20:]
    addr = base58.b58encode_check(primitive_addr)
    return addr.decode()


def public_key_to_addr(pub_key: bytes) -> bytes:
    return b"\x41" + keccak256(pub_key)[-20:]


def to_base58check_address(raw_addr: Union[str, bytes]) -> str:
    """Convert hex address or base58check address to base58check address(and verify it)."""
    if isinstance(raw_addr, (str,)):
        if raw_addr[0] == "T" and len(raw_addr) == 34:
            try:
                # assert checked
                base58.b58decode_check(raw_addr)
            except ValueError:
                raise BadAddress("bad base58check format")
            return raw_addr
        elif len(raw_addr) == 42:
            if raw_addr.startswith("0x"):  # eth address format
                return base58.b58encode_check(b"\x41" + bytes.fromhex(raw_addr[2:])).decode()
            else:
                return base58.b58encode_check(bytes.fromhex(raw_addr)).decode()
        elif raw_addr.startswith("0x") and len(raw_addr) == 44:
            return base58.b58encode_check(bytes.fromhex(raw_addr[2:])).decode()
    elif isinstance(raw_addr, (bytes, bytearray)):
        if len(raw_addr) == 21 and int(raw_addr[0]) == 0x41:
            return base58.b58encode_check(raw_addr).decode()
        if len(raw_addr) == 20:  # eth address format
            return base58.b58encode_check(b"\x41" + raw_addr).decode()
        return to_base58check_address(raw_addr.decode())
    raise BadAddress(repr(raw_addr))


def to_hex_address(raw_addr: Union[str, bytes]) -> str:
    addr = to_base58check_address(raw_addr)
    return base58.b58decode_check(addr).hex()


def to_raw_address(raw_addr: Union[str, bytes]) -> bytes:
    addr = to_base58check_address(raw_addr)
    return base58.b58decode_check(addr)


def to_tvm_address(raw_addr: Union[str, bytes]) -> bytes:
    return to_raw_address(raw_addr)[1:]


def is_base58check_address(value: str) -> bool:
    return value[0] == "T" and len(base58.b58decode_check(value)) == 21


def is_hex_address(value: str) -> bool:
    return value.startswith("41") and len(bytes.fromhex(value)) == 21


def is_address(value: str) -> bool:
    return is_base58check_address(value) or is_hex_address(value)


class BaseKey(ByteString, Hashable):
    _raw_key = None  # type: bytes

    # compatible with bytes.hex()
    def hex(self) -> str:
        """
        Key as a hex str.

        :returns: A hex str.
        """
        return self._raw_key.hex()

    @classmethod
    def fromhex(cls, hex_str: str) -> "BaseKey":
        """
        Construct a key from a hex str.

        :returns: The key object.
        """
        return cls(bytes.fromhex(hex_str))

    def to_bytes(self) -> bytes:
        return self._raw_key

    def __hash__(self) -> int:
        return int.from_bytes(self._raw_key, "big")

    def __str__(self) -> str:
        return self.hex()

    def __int__(self) -> int:
        return int.from_bytes(self._raw_key, "big")

    def __len__(self) -> int:
        return len(self._raw_key)

    # Must be typed with `ignore` due to
    # https://github.com/python/mypy/issues/1237
    def __getitem__(self, index: int) -> int:  # type: ignore
        return self._raw_key[index]

    def __eq__(self, other: Any) -> bool:
        if hasattr(other, "to_bytes"):
            return self.to_bytes() == other.to_bytes()
        elif isinstance(other, (bytes, bytearray)):
            return self.to_bytes() == other
        else:
            return False

    def __repr__(self) -> str:
        return repr(self.hex())

    def __index__(self) -> int:
        return self.__int__()

    def __hex__(self) -> str:
        return self.hex()


class PublicKey(BaseKey):
    """The public key."""

    def __init__(self, public_key_bytes: bytes):
        try:
            assert isinstance(public_key_bytes, (bytes,))
            assert len(public_key_bytes) == 64
        except AssertionError:
            raise BadKey

        self._raw_key = public_key_bytes

        super().__init__()

    @classmethod
    def recover_from_msg(cls, message: bytes, signature: "Signature"):
        """Recover public key(address) from raw message and signature."""
        return signature.recover_public_key_from_msg(message)

    @classmethod
    def recover_from_msg_hash(cls, message_hash: bytes, signature: "Signature"):
        """Recover public key(address) from message hash and signature."""
        return signature.recover_public_key_from_msg_hash(message_hash)

    def verify_msg(self, message: bytes, signature: "Signature") -> bool:
        """Verify message and signature."""
        return signature.verify_msg(message, self)

    def verify_msg_hash(self, message_hash: bytes, signature: "Signature") -> bool:
        """Verify message hash and signature."""
        return signature.verify_msg_hash(message_hash, self)

    # Address conversions
    def to_base58check_address(self) -> str:
        """Get the base58check address of the public key."""
        return public_key_to_base58check_addr(self._raw_key)

    def to_hex_address(self) -> str:
        return public_key_to_addr(self._raw_key).hex()

    def to_address(self) -> bytes:
        return public_key_to_addr(self._raw_key)

    def to_tvm_address(self) -> bytes:
        return public_key_to_addr(self._raw_key)[1:]


class PrivateKey(BaseKey):
    """The private key."""

    public_key = None

    def __init__(self, private_key_bytes: bytes):
        try:
            assert isinstance(private_key_bytes, (bytes,))
            assert len(private_key_bytes) == 32
            assert (
                0
                < int.from_bytes(private_key_bytes, "big")
                < 115792089237316195423570985008687907852837564279074904382605163141518161494337
            )
        except AssertionError:
            raise BadKey

        self._raw_key = private_key_bytes

        priv_key = ecdsa.SigningKey.from_string(self._raw_key, curve=ecdsa.SECP256k1)
        self.public_key = PublicKey(priv_key.get_verifying_key().to_string())

        super().__init__()

    def sign_msg(self, message: bytes) -> "Signature":
        """Sign a raw message."""
        sk = ecdsa.SigningKey.from_string(self._raw_key, curve=ecdsa.SECP256k1, hashfunc=hashlib.sha256)
        signature = sk.sign_deterministic(message)

        # recover address to get rec_id
        vks = ecdsa.VerifyingKey.from_public_key_recovery(
            signature, message, curve=ecdsa.SECP256k1, hashfunc=hashlib.sha256
        )
        for v, pk in enumerate(vks):
            if pk.to_string() == self.public_key:
                break

        signature += bytes([v])
        return Signature(signature)

    def sign_msg_hash(self, message_hash: bytes) -> "Signature":
        """Sign a message hash(sha256)."""
        sk = ecdsa.SigningKey.from_string(self._raw_key, curve=ecdsa.SECP256k1, hashfunc=hashlib.sha256)
        signature = sk.sign_digest_deterministic(message_hash)

        # recover address to get rec_id
        vks = ecdsa.VerifyingKey.from_public_key_recovery_with_digest(
            signature, message_hash, curve=ecdsa.SECP256k1, hashfunc=hashlib.sha256
        )
        for v, pk in enumerate(vks):
            if pk.to_string() == self.public_key:
                break

        signature += bytes([v])
        return Signature(signature)

    @classmethod
    def random(cls) -> "PrivateKey":
        """Generate a random private key."""
        return cls(bytes([random.randint(0, 255) for _ in range(32)]))

    @classmethod
    def from_passphrase(cls, passphrase: bytes) -> "PrivateKey":
        """Get a private key from sha256 of a passphrase."""
        return cls(sha256(passphrase))


class Signature(ByteString):
    """The signature object."""

    _raw_signature = None

    def __init__(self, signature_bytes: bytes):
        try:
            assert isinstance(signature_bytes, (bytes,))
            assert len(signature_bytes) == 65
            assert signature_bytes[-1] in [0, 1]
        except AssertionError:
            raise BadSignature

        self._raw_signature = signature_bytes

        super().__init__()

    def recover_public_key_from_msg(self, message: bytes) -> PublicKey:
        """Recover public key(address) from message and signature."""
        vks = ecdsa.VerifyingKey.from_public_key_recovery(
            self._raw_signature[:64], message, curve=ecdsa.SECP256k1, hashfunc=hashlib.sha256
        )
        return PublicKey(vks[self.v].to_string())

    def recover_public_key_from_msg_hash(self, message_hash: bytes) -> PublicKey:
        """Recover public key(address) from message hash and signature."""
        vks = ecdsa.VerifyingKey.from_public_key_recovery_with_digest(
            self._raw_signature[:64], message_hash, curve=ecdsa.SECP256k1, hashfunc=hashlib.sha256
        )
        return PublicKey(vks[self.v].to_string())

    def verify_msg(self, message: bytes, public_key: PublicKey) -> bool:
        """Verify message and signature."""
        vk = ecdsa.VerifyingKey.from_string(public_key.to_bytes(), curve=ecdsa.SECP256k1)
        return vk.verify(self._raw_signature[:64], message, hashfunc=hashlib.sha256)

    def verify_msg_hash(self, message_hash: bytes, public_key: PublicKey) -> bool:
        """Verify message hash and signature."""
        vk = ecdsa.VerifyingKey.from_string(public_key.to_bytes(), curve=ecdsa.SECP256k1)
        return vk.verify_digest(self._raw_signature[:64], message_hash)

    @property
    def v(self) -> int:
        return self._raw_signature[64]

    def hex(self) -> str:
        """
        Return signature as a hex str.

        :returns: A hex str.
        """
        return self._raw_signature.hex()

    @classmethod
    def fromhex(cls, hex_str: str) -> 'Signature':
        """Construct a Signature from hex str."""
        return cls(bytes.fromhex(hex_str))

    def to_bytes(self) -> bytes:
        return self._raw_signature

    def __hash__(self) -> int:
        return int.from_bytes(self._raw_signature, "big")

    def __str__(self) -> str:
        return self.hex()

    def __int__(self) -> int:
        return int.from_bytes(self._raw_signature, "big")

    def __len__(self) -> int:
        return 65

    def __getitem__(self, index: int) -> int:  # type: ignore
        return self._raw_signature[index]

    def __eq__(self, other: Any) -> bool:
        if hasattr(other, "to_bytes"):
            return self.to_bytes() == other.to_bytes()
        elif isinstance(other, (bytes, bytearray)):
            return self.to_bytes() == other
        else:
            return False

    def __repr__(self) -> str:
        return repr(self.hex())

    def __index__(self) -> int:
        return self.__int__()

    def __hex__(self) -> str:
        return self.hex()


__all__ = [
    "PrivateKey",
    "PublicKey",
    "Signature",
    "to_base58check_address",
    "to_hex_address",
    "to_tvm_address",
    "is_address",
    "is_base58check_address",
    "is_hex_address",
]

```

cache.py
```python
import os.path
from pathlib import Path
import json



class Cache(object):

    def get(self,filename):
        try:
            file=open(filename,encoding='utf-8')
        except :
            return None
        content=file.read()
        try:
            return json.loads(content)
        except :
            return content


    def set(self,filename,content):
        self.checkFileExist(filename=filename)
        fo=open(filename, "w",encoding='utf-8')
        if isinstance(content, str):
            fo.write(content)
        else:
            fo.write(json.dumps(content))
        fo.close()

    def append(self,filename,conent,isPrint:bool=False):
        if isPrint is True:
            print(conent)
        # self.checkFileExist(filename=filename)
        # fo = open(filename, "a",encoding='utf-8')
        # fo.write(conent+"\n")
        # fo.close()

    def checkFileExist(self,filename):
        filenameName = filename.split('/')
        filenameName.pop(-1)
        path="/".join(filenameName)
        folder = os.path.exists(path)
        if not folder:  # 判断是否存在文件夹如果不存在则创建为文件夹
            os.makedirs(path)  # makedirs 创建文件时如果路径不存在会创建这个路径
        # fo = open(filename, "w")
        # fo.close()
```