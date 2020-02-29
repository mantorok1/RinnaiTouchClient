var http = require('http');
var RinnaiTouchClient = require('./RinnaiTouchClient');

http.createServer((req, res) => {

    if (req.url === "/") {
        // No command so return status
        var client = RinnaiTouchClient.createClient();
        client.on('statusChanged', (status) => {
            client.close();
            res.write(status);
            res.end();
        });
    } else {
        // Command received so send it
        var components = req.url.split('/');
        if (components.length === 3) {
            var command = JSON.parse(`{"${components[1]}":"${components[2]}"}`);
            var client = RinnaiTouchClient.createClient();
            client.on('ready', () => {
                client.send(command)
            });
            client.on('commandSent', () => {
                client.close();
                res.write('command sent');
                res.end();
            });
        } else {
            res.end();
        }
    }
}).listen(8080);