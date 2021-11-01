---
title: "Dapp"
date: 2021-10-31T10:08:33+08:00
weight: 2
---
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
    <meta charset="UTF-8">
    <title>dapp</title>
</head>
<body>
<div id="vue">
    目标地址:<input v-model="to_address" style="width: 100%">
    订单编号:<input v-model="transaction" style="width: 100%">
    <br/>
    <br/>
    <button @click="init_tronWeb">
        登录tronlink
    </button>
    <button @click="transferTrx">
        transferTrx
    </button>
    <button @click="getBalance">
        获取trx余额
    </button>
    <button @click="getUSDTBalance">
        获取usdt余额
    </button>
    <button @click="transferUSDT">
        转账0.001usdt
    </button>
    <button @click="transferUSDTRemark">
        带备注的转账0.001usdt
    </button>
    <button @click="getTransaction">
        获取交易详情
    </button>
    <p v-show="result.length" v-html="result.join('<br/>')"></p>
</div>
<script src="./js/tronweb.js"></script>
<script src="./js/trongrid.js"></script>
<script src="./js/vue.min.js"></script>
<script src="./js/jQuery-2.1.4.min.js"></script>

<script>
    window.addEventListener('message', function (e) {
        // console.log('message');
        // console.log(e);
        if (e.data.message && e.data.message.action == "tabReply") {
            // console.log("tabReply event", e.data.message)
            // if (e.data.message.data.data.node.chain == '_') {
            // console.log("tronLink currently selects the main chain")
            // } else {
            // console.log("tronLink currently selects the side chain")
            // }
        }

        if (e.data.message && e.data.message.action == "setAccount") {
            // console.log("setAccount event", e.data.message)
            // console.log("current address:", e.data.message.data.address)

        }
        if (e.data.message && e.data.message.action == "setNode") {
            // console.log("setNode event", e.data.message)
            if (e.data.message.data.node.chain == '_') {
                // console.log("tronLink currently selects the main chain")
            } else {
                // console.log("tronLink currently selects the side chain")
            }

        }
    })

    // const HttpProvider = TronWeb.providers.HttpProvider;
    // const fullNode = new HttpProvider("https://api.shasta.trongrid.io");
    // const solidityNode = new HttpProvider("https://api.shasta.trongrid.io");
    // const eventServer = new HttpProvider("https://api.shasta.trongrid.io");
    // const privateKey = "";
    // console.log(window.tronWeb);
    // window.tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

    // var vconsole = new VConsole();
    // var tronGrid = new trongrid(tronWeb);
    // console.log(tronGrid);
    var vue = new Vue({
        el: "#vue",
        data: {
            usdtContract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
            tronWeb: null,
            walletAddress: '',
            contract: null,
            address: "TXUt69QwQ9ghirUviCtZudzCM1pP7EDfX3", // eee
            result: [],
            to_address: "TAmXc5JmMecTSexXydSnJmaZEUxFgAxMw7", //sdhl
            transaction: "5d760063a0969530842ed933836f6fb6f81e593fc913e83a1acb5707e61f7f41",
        },
        methods: {
            //获取交易详情
            getTransaction() {
                // 交易单号 d449953019071634a0ffe0f969908480478c4293f61c3bd6276f5b05152bc798
                this.tronWeb.trx.getTransaction(this.transaction).then(result => {
                    vue.result.push("交易单号:" + this.transaction);
                    vue.result.push("<pre>" + JSON.stringify(result, null, 2) + "</pre>");
                });
            },
            async transferTrx(){
                var unSignedTxn = await this.tronWeb.transactionBuilder.sendTrx(vue.to_address, 1);
                console.log(unSignedTxn);
                // var unSignedTxnWithNote = await this.tronWeb.transactionBuilder.addUpdateData(unSignedTxn, {data:"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}, 'utf8');
                var unSignedTxnWithNote = await this.tronWeb.transactionBuilder.addUpdateData(unSignedTxn, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", 'utf8');
                console.log(unSignedTxnWithNote);

                var signedTxn = await this.tronWeb.trx.sign(unSignedTxnWithNote);
                console.log(signedTxn);
                // const broastTx = await this.tronWeb.trx.sendRawTransaction(signedTxn);
                // console.log( broastTx);


                // vue.result.push("调用成功");
                // vue.result.push("交易订单号:" + broastTx.txid);
                // vue.transaction = broastTx.txid;
                // this.getTransaction();
            },
            //usdt转账
            async transferUSDT() {
                const parameter = [{type: 'address', value: vue.to_address}, {type: 'uint256', value: 1000}];
                var tx = await this.tronWeb.transactionBuilder.triggerSmartContract(
                    this.usdtContract,
                    "transfer(address,uint256)",
                    {
                        // feeLimit:0.01*Math.pow(10,6),
                    },
                    parameter,
                    this.walletAddress
                );
                var signedTx = await this.tronWeb.trx.sign(tx.transaction);
                var broastTx = await this.tronWeb.trx.sendRawTransaction(signedTx);
                console.log(broastTx);
                vue.result.push("调用成功");
                vue.result.push("交易订单号:" + broastTx.txid);
                vue.transaction = broastTx.txid;
                this.getTransaction();

            },
            //usdt转账 (带备注)
            async transferUSDTRemark() {
                const parameter = [{type: 'address', value: vue.to_address}, {type: 'uint256', value: 1000}];
                var tx = await this.tronWeb.transactionBuilder.triggerSmartContract(
                    this.usdtContract,
                    "transfer(address,uint256)",
                    {
                        // feeLimit:0.01*Math.pow(10,6),
                    },
                    parameter,
                    this.walletAddress
                );
                var r = await this.tronWeb.transactionBuilder.addUpdateData(tx.transaction, "备注信息", 'utf8');
                var signedTx = await this.tronWeb.trx.sign(r);
                var broastTx = await this.tronWeb.trx.sendRawTransaction(signedTx);
                console.log(broastTx);
                vue.result.push("调用成功");
                vue.result.push("交易订单号:" + broastTx.txid);
                vue.transaction = broastTx.txid;
                this.getTransaction();

            },
            //获取usdt余额
            async getUSDTBalance() {
                this.tronWeb.contract().at(this.usdtContract).then(contract => {
                    contract.balanceOf(this.walletAddress).call().then(resp => {
                        console.log(resp);
                        var balance = vue.tronWeb.toDecimal(resp._hex)
                        vue.result.push("USDT余额:" + vue.tronWeb.fromSun(balance));

                    })
                });
            },
            //trx转账交易
            async transaction() {
                var tx = await this.tronWeb.transactionBuilder.sendTrx(
                    this.walletAddress,
                    0.01 * Math.pow(10, 6),
                    this.to_address
                );
                var signedTx = await this.tronWeb.trx.sign(tx);
                var broastTx = await this.tronWeb.trx.sendRawTransaction(signedTx);
                vue.result.push("交易订单号:" + broastTx);

            },
            init_tronWeb() {
                if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
                    this.tronWeb = window.tronWeb;
                    this.walletAddress = this.tronWeb.defaultAddress.base58;
                    vue.result.push("钱包地址:" + this.walletAddress);
                }

            },
            //查询钱包余额
            async getBalance() {
                //当前连接的钱包地址获取 window.tronWeb.defaultAddress.base58
                var balance = await this.tronWeb.trx.getBalance(this.walletAddress);
                vue.result.push("trx可用余额:" + vue.tronWeb.fromSun(balance));

            },


        },
        mounted: function () {
            this.$nextTick(function () {
                var obj = setInterval(() => {
                    vue.init_tronWeb();
                    if (vue.walletAddress) {
                        clearInterval(obj)
                        console.log(vue.walletAddress);
                    } else if (!window.tronWeb) {
                        clearInterval(obj)
                        vue.result.push("请安装tronlink插件或者app上打开");
                    }
                }, 1000)
            })
        }
    })
</script>

</body>
</html>

```