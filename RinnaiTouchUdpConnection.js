const EventEmmitter = require('events');
const dgram = require('dgram');

class RinnaiTouchUdpConnection extends EventEmmitter {
    constructor() {
        super();
        this.port = 50000;
        this.timeout = 5000; // 5 sec
    }

    connect() {
        this.socket = dgram.createSocket('udp4');

        this.socket.on('message', (message, remote) => {
            if (message.toString().substr(0, 18) === 'Rinnai_NBW2_Module') {
                this.disconnect();
                var port = message[32] * 256 + message[33];
                this.emit('address', { address: remote.address, port: port });
            }            
        });

        this.socket.on('error', (error) => {
            this.disconnect();
            this.emit('error', error);
        });

        this.timer = setTimeout(() => {
            this.disconnect();
            this.emit('error', new Error('Timeout occured. Could not connect to Rinnai Touch Module'));
        }, this.timeout);

        this.socket.bind(this.port);
    }

    disconnect() {
        clearTimeout(this.timer);
        this.socket.close();
    }

    static getAddress(callback) {
        var self = new RinnaiTouchUdpConnection();
        self.on('address', (address) => {
            if (callback && typeof callback === "function") {
                callback(address);
            }
        });
        self.on('error', (error) => {
            if (callback && typeof callback === "function") {
                callback(undefined, error);
            }
        });
        self.connect();
    }

}

module.exports = RinnaiTouchUdpConnection;