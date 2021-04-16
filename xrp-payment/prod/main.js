#!/usr/bin/env node

const product_amt = process.argv[process.argv.length-2]
const product_id = process.argv[process.argv.length-1]


const setup_account = require('./helpers/setup_account')
setup_account(
    {amount: parseInt(product_amt)},
    (address)=>{console.log('ADDRESS',address)},
    (txID)=>{
        console.log('SUCCESS',txID+`#${product_id}`);
    },
    (err)=>console.error('ERROR', err),
    false,
)


/*

  * Earning Address:::::
  * PUB KEY: rN4RioabywPmRtDztPE9qhwiAkGJT5dT1b
  * PRIV KEY: snMByMKZ5DsreB3dd9677Atv8RthU

*/