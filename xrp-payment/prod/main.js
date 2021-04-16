#!/usr/bin/env node

var product_amt = process.argv[process.argv.length-3]
var product_id = process.argv[process.argv.length-2]
var isDev = process.argv[process.argv.length-1]

if(isDev === 'true') {
	isDev=true;
} else if (isDev === 'false') {
	isDev=false;
};


const setup_account = require('./helpers/setup_account')
setup_account(
    {amount: parseInt(product_amt)},
    (address)=>{console.log('ADDRESS',address)},
    (txID)=>{
        console.log('SUCCESS',txID+`#${product_id}`);
    },
    (err)=>console.error('ERROR', err),
    isDev
)


/*
  * Earning Address:::::
  * PUB KEY: rN4RioabywPmRtDztPE9qhwiAkGJT5dT1b
  * PRIV KEY: snMByMKZ5DsreB3dd9677Atv8RthU
*/