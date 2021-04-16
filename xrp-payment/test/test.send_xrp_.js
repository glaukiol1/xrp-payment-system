const ripple = require('ripple-lib')

let api = new ripple.RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' })

let dest = 'r4VzBGVE5VFdRoa56ZLe4ik4DwPhN3tZQT';
let address = 'rBHvyTVagY9FavMayyb4j7mCToaxpVZhNB';
let secret = 'snttQh1YzdrAP99VV4XZ32Zj27DpY';
let amount = 25;
    api.connect()
    api.on('connected', async () => {
        const preparedTx = await api.prepareTransaction({
            "TransactionType": "Payment",
            "Account": address,
            "Amount": api.xrpToDrops(`${amount}`), // Same as "Amount": "22000000"
            "Destination": dest
        }, {
            // Expire this transaction if it doesn't execute within ~5 minutes:
            "maxLedgerVersionOffset": 75
        })

        const signed = api.sign(preparedTx.txJSON, secret)
        const txID = signed.id;
        const tx_blob = signed.signedTransaction

        const earliestLedgerVersion = (await api.getLedgerVersion())
        console.log(earliestLedgerVersion)
        const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion
        const org_tx = await api.submit(tx_blob)
        let has_final_status = false
        api.request("subscribe", { accounts: [address] })
        api.connection.on("transaction", (event) => {
            if (event.transaction.hash == txID) {
                has_final_status = true
            }
        })
        api.on('ledger', ledger => {
            if (ledger.ledgerVersion > maxLedgerVersion && !has_final_status) {
                return {err:true,msg:undefined}
            }
        })
        var i=0;
        const check = () => {
            setTimeout( async () => {
                try {
                    var tx = await api.getTransaction(txID, {
                        minLedgerVersion: earliestLedgerVersion})
                    if (tx.outcome.result==='tesSUCCESS') {
                        return tx.id
                    }
                } catch (err) {
                    if(i<60) {
                        i++
                        check()
                    } else {
                        return {err:true,msg:err}
                    }
                }
            },1000)
        }
        check()

    })