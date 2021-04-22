"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const express = require("express");
const http = require("http");
const https = require('https')
const WebSocket = require("ws");
const fs = require('fs')
const app = express();
const path = require('path')
const uuid = require('uuid').v1;
app.use(express.static(path.join(__dirname, 'public')))

// Load config files |||| ../config
const addresses = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/addresses.json')))
const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/products.json')))
const process_opt = JSON.parse ( fs.readFileSync(path.join(__dirname, '../config/process-opt.json')) )

const getProtocol = () => {
    if (process_opt.PROTOCOL !== 'https'){
        return http
    } else {
        return https
    }
}

const DEFAULT_PORT = 3003;
const PORT = process_opt.PORT

const server = getProtocol().createServer(app);
const wss = new WebSocket.Server({ server });

const map = products.products;
const map_names=products["product-names"]

app.get('/payment', (req, res) => {
    if (req.query.productId) {
        if (req.query.isFinal) {
            res.status(200).sendFile(path.join(__dirname, 'index.html'))
        } else {
            
            res.redirect(`/?prodName=${map_names[req.query.productId]}&productId=${req.query.productId}&id=${uuid()}&amt=${map[req.query.productId]}isFinal=true`)
        }
    } else {
        res.status(400).send('<h1>400 Bad Request</h1><br><p>Missing Query Parm `productId`</p><a href="https://github.com/glaukiol1/xrp-payment-system">GitHub Repo</a>')
    }
})
app.get('/payment-port-get', (req,res)=>{
    res.status(200).json({PORT: PORT||DEFAULT_PORT})
})
wss.on('connection', (ws) => {
    var amt;
    var id;
    ws.on('message', (message) => {
        //log the received message and send it back to the client
        console.log('received: %s', message);
        const broadcastRegex = /^broadcast\:/;
        // if (broadcastRegex.test(message)) {
        // message = message.replace(broadcastRegex, '');
        // //send back the message to the other clients
        // wss.clients
        //     .forEach(client => {
        //     if (client != ws) {
        //         client.send(`Hello, broadcast message -> ${message}`);
        //     }
        // });
        // }
        // else {
        ws.send(`Recived ${message}, setting params!`);
        amt = map[parseInt(new URL(message).searchParams.get('productId'))]
        id = new URL(message).searchParams.get('id')
        var child = child_process_1.exec(`xrp-payment ${id} ${process_opt.DEV}`);
        child.stdout.on('data', function (data) {
            console.log(data)
            if (data.indexOf('ADDRESS') !== -1) {
                var address = data.split(' ')[1]
                ws.send(`ADDRESS ${address}`);
            }
            else if (data.indexOf('SUCCESS ') !== -1) {
                var TxHash = data.split(' ')[1].split('#')[0];
                var productId = data.split(' ')[1].split('#')[1];
                console.log(productId,TxHash)
                ws.send(`SUCCESS ${TxHash}`);
            }
        });
        child.stderr.on('data', function (data) {
            ws.send(`ERROR ${data}`);
        });

        // }
    });
    
    ws.send('CONNECTION SUCCESSFULL');
});
//start our server
server.listen(PORT||DEFAULT_PORT, () => {
    console.log(`Server started on port ${PORT||DEFAULT_PORT} :)`);
});
// app.get('/', (req,res)=>{
// })
//# sourceMappingURL=test-server.js.map