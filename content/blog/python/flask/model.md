---
title: "model"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

\_\_init__.py
```python
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()
from model.UserModel import UserModel
from model.FamilyModel import FamilyModel
from model.RecordModel import RecordModel
from model.RecordConfigModel import RecordConfigModel
from model.UserPlatformModel import UserPlatformModel



__all__ = [
    "UserModel",
    "UserPlatformModel",
    "FamilyModel",
    "RecordModel",
    "RecordConfigModel",
]
```

BaseModel.py  
```python
import datetime
from model import db


class BaseModel(db.Model):
    __abstract__ = True
    # __tablename__ = 'model'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now)

    # db.session.add(order)
    # db.session.flush()
    # # 输出新插入数据的主键
    # # printNLog("order.id=%s" % order.id)
    # db.session.commit()
    # # 此时数据才插入到数据库中

    def save(self):
        db.session.add(self)
        db.session.flush()
        db.session.commit()
        return self

```

UserModel.py
```python
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import hashlib
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer, SignatureExpired, BadSignature
from model.BaseModel import BaseModel

db = SQLAlchemy()


class UserModel(BaseModel):
    __tablename__ = 'user'

    name = db.Column(db.String(64, 'utf8mb4_unicode_ci'), nullable=False)
    account = db.Column(db.String(255, 'utf8mb4_unicode_ci'), nullable=False)
    password = db.Column(db.String(255, 'utf8mb4_unicode_ci'), nullable=False)
    family_id = db.Column(db.Integer, nullable=False, default=0,server_default=text("0"))

    @staticmethod
    def create_password(str):
        password = str + "_salt"
        return hashlib.md5(bytes(password, encoding='utf-8')).hexdigest()

    @staticmethod
    def verify_auth_token(token):
        print(token)
        s = Serializer("qweqweqwe")
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None  # valid token, but expired
        except BadSignature:
            return None  # invalid token
        user = UserModel.query.get(data['id'])
        return user

```