/*
@author alex
接收 Weex 远程log, 用于调试
 */
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const hostname = require('ip').address();
const port = 8100;

let wsList = [];

const server = http.createServer((req, res) => {
    let path = url.parse(req.url).pathname;
    if (path === '/' && req.method === 'GET') {
        res.statusCode = 200;
        res.end(html);
    } else if (path === '/log' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', () => {
            console.log(body);
            try {
                wsList.forEach(i => i.send(JSON.stringify({ type: 'LOG', data: body })));
            } catch (e) {
                console.log(e);
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 200, success: true, msg: 'success', data: null }));
        });
    } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 200, success: true, msg: 'success', data: null }));
    }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
    wsList.push(ws);
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });
    // 发送心跳包
    let timer = setInterval(() => {
        ws.send(JSON.stringify({ type: 'HEART_BEAT' }));
    }, 1000);
    ws.onclose = function() {
        wsList.splice(wsList.indexOf(ws), 1);
        clearInterval(timer);
    };
});

server.listen(port, hostname, () => {
    console.log(`Server run at: http://${hostname}:${port}/`);
});

let html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no,maximum-scale=1.0,minimum-scale=1.0">
    <link rel="shortcut icon" href="https://sz-ht.oss-cn-shenzhen.aliyuncs.com/ht_win/weex-layout/icon.png">
    <title>Weex debug</title>
    <style>
        .connect {
            color: green;
        }
        .disconnect {
            color: red;
        }
    </style>
  </head>
  <body>
    <h1>Weex debug page <span id="status">DISCONNECTED</span></h1>
    <p>Press cmd+option+i to show console</p>
    <script>
    window.reconnectTimers = [];
    function showConnect() {
        window.clearTimeout(window.statusTimer);
        reconnectTimers.forEach(i => window.clearInterval(i));
        document.querySelector('#status').innerHTML = 'CONNECTING';
        document.querySelector('#status').classList = ['connect'];
        window.statusTimer = window.setTimeout(() => {
            document.querySelector('#status').innerHTML = 'DISCONNECTED';
            document.querySelector('#status').classList = ['disconnect'];
            window.reconnectTimers.push(window.setInterval(() => {
                connect();
            }, 3000));
        }, 1500);
    }

    function connect() {
        if (window.socket) {
            try {
                window.socket.close();
            } catch(e) {}
        }
        window.socket = new WebSocket('ws://${hostname}:${port}');
        // Connection opened
        window.socket.addEventListener('open', function (event) {
            console.log('WebSocket connected');
            showConnect();
        });
        window.socket.addEventListener('message', function (event) {
            let data = JSON.parse(event.data);
            if (data.type === 'HEART_BEAT') {
                showConnect();
            } else if (data.type === 'LOG') {
                let obj = JSON.parse(data.data);
                console.log('%c' + obj.tag.map(i => '['+i+']').join(' '), 'color:' + ['#2980b9', '#FF9900', '#FF0000'][obj.level], obj.message);
            }
        });
    }

    connect();
    
    </script>
  </body>
</html>
`;
