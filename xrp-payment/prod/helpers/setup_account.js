const ripple = require('ripple-lib')
const get_account_info = require('./get_account_info')
const send_xrp = require('./send_xrp')
const fs = require('fs')
const path = require('path')

let api = new ripple.RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' })

const addresses = JSON.parse( fs.readFileSync(path.join(__dirname, '../../../config/addresses.json')) )
const addr_earning = addresses.earningAddress;

module.exports = async function(product_info,addressReturn,onSuccess,onError,isDev)
{
let address
let secret
if(isDev){
    address='r4VzBGVE5VFdRoa56ZLe4ik4DwPhN3tZQT';
    secret='ssyArfg6t9ReHdm1Gk7iQH3Z7ymDr';
} else {
    var addr = api.generateAddress();
    address=addr.address;
    secret=addr.secret;
}
var f=addresses;
console.error(f)
f.knownAddresses.push(
    {
        address,
        secret
    }
)
f=JSON.stringify(f)
fs.writeFileSync( fs.readFileSync(path.join(__dirname, '../../../config/addresses.json')), f)
send_xrp(address,addr_earning.publicKey,addr_earning.secretKey,20,true)
addressReturn(address+`#${product_info.amount}`)
var i=0;
var done=false;
setTimeout( () => {
    setInterval( () => {
        i++
        if (i<1200) {
            get_account_info(address, (data)=>{data.then(async (res)=>{
                var transactionTx=res.previousAffectingTransactionID;
                var balance=res.xrpBalance
                var transactionTxValue;
                var transactionFee;
                var source;
                api.connect()
                await api.getTransaction(transactionTx).then(r=>{
                    transactionTxValue = r.outcome.deliveredAmount.value
                    transactionFee = r.outcome.fee
                    source = (r.specification.source.address)
                })
                if (transactionTxValue<100&&transactionTxValue>=product_info.amount-1&&source!==addr_earning.publicKey) {
                    send_xrp(addr_earning.publicKey,address,secret,(parseInt(balance)-10),'iodjaiodjadoiajdoaidjaoidja')
                    onSuccess(transactionTx)
                    done=true;
                    i=1201
                } else {
                    if (transactionTxValue<=product_info.amount-2){
                        onError(`Amount Is Not Valid!`)
                    } else if (transactionTxValue>100) {
                        onError(`The Transaction Has Not Yet Come OR The value is over the maximum 100 XRP.`)
                    }
                }
            })})
        }
        if (i>1200||done) {
            console.log(done)
            if(done) {
                api.disconnect();
                process.exit(0)
            } else {
                console.error(`FATAL Session Expired`)
                process.exit(1)
            }
        }
    },1500)
}, 20000)
    
}