// Sample CLI tool to control Rinnai Touch Module 

var RinnaiTouchClient = require('./RinnaiTouchClient');

var args = process.argv.slice(2);
var isClosed = false;

var client = RinnaiTouchClient.createClient();
client.on('statusChanged', (status) => {
    if (args.length === 0) {
        console.log(status);
        client.close();
    }
});
client.on('ready', () => {
    console.log(`Connected: ${client.connection.socket.remoteAddress}:${client.connection.socket.remotePort}`)
    if (args.length === 2) {
        var command = JSON.parse(`{"${args[0]}":"${args[1]}"}`);
        client.send(command);
    }
});
client.on('error', (error) => {
    console.error(error);
    client.close();
});
client.on('commandSent', () => {
    console.log('Command sent');
    client.close();
});
client.on('close', () => {
    isClosed = true;
    console.log('Connection Closed');
    process.exit();
});

setTimeout(() => {
    if (!isClosed)
    {
        console.log('Timed out.');
        client.close();
    }
}, 10000)
