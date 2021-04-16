const ripple = require('ripple-lib')

let api = new ripple.RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' })

module.exports = (dest,address,secret,amount,nonCheck) => {
    console.log(dest,address,secret,amount,nonCheck)
    api.connect()
    api.on('connected', async () => {
        try {
            console.log('kdoiajdaoidja')
            const preparedTx = await api.prepareTransaction({
                "TransactionType": "Payment",
                "Account": address,
                "Amount": api.xrpToDrops(`${amount}`),
                "Destination": dest
            }, {
                // Expire this transaction if it doesn't execute within ~5 minutes:
                "maxLedgerVersionOffset": 75
            })
            const signed = api.sign(preparedTx.txJSON, secret)
            console.log('second sokdaoidjaoidjad')
            const txID = signed.id;
            const tx_blob = signed.signedTransaction
    
            const earliestLedgerVersion = (await api.getLedgerVersion())+1
            const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion
            const org_tx = await api.submit(tx_blob)
            api.disconnect()
            console.debug(org_tx)
            process.exit(0)
        } catch (err) {
            console.error('ERROR ERROR ERROR %s',err)
        }
        if (nonCheck){return 1;}
        else {

    //         let has_final_status = false
    //         api.request("subscribe", { accounts: [address] })
    //         api.connection.on("transaction", (event) => {
    //             if (event.transaction.hash == txID) {
    //                 has_final_status = true
    //                 return true;
    //             }
    //         })
    //         api.on('ledger', ledger => {
    //             if (ledger.ledgerVersion > maxLedgerVersion && !has_final_status) {
    //                 return {err:true,msg:undefined}
    //             }
    //         })
    //         var i=0;
    //         if(!nonCheck) {
    //             console.log('hoooyaahhhh')
    //             const check = () => {
    //                 setTimeout( async () => {
    //                     try {
    //                         var tx = await api.getTransaction(txID, {
    //                             minLedgerVersion: earliestLedgerVersion})
    //                         if (tx.outcome.result==='tesSUCCESS') {
    //                             return tx.id
    //                         }
    //                     } catch (err) {
    //                         if(i<60) {
    //                             i++
    //                             check()
    //                         } else {
    //                             return {err:true,msg:err}
    //                         }
    //                     }
    //                 },1000)
    //             }
    //             check()
    //         }
    
        }
    })
        
}