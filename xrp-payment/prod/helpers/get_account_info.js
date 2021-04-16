

module.exports = (address,cb) => 
{
    'use strict';
    const RippleAPI = require('ripple-lib').RippleAPI;
    const api = new RippleAPI({
        server: 'wss://s.altnet.rippletest.net:51233'
    });
    api.connect().then(() => {
        const myAddress = address;
        cb(api.getAccountInfo(myAddress))
        api.disconnect()
    })
        .catch(console.error);
}