const RinnaiTouchUdpConnection = require('./RinnaiTouchUdpConnection');
const EventEmmitter = require('events');
const net = require('net');

class RinnaiTouchTcpConnection extends EventEmmitter {
    constructor() {
        super();
        this.isReady = false;
    }

    _createConnection(address) {
        this.socket = new net.Socket();

        this.socket.on('data', (data) => {
            data = data.toString();
            this.emit('data', data);
            if (data.substr(0, 1) === "N") {
                if (!this.isReady) {
                    this.isReady = true;
                    this.emit('ready');
                }
                this.emit('status', data.substr(7));
            }
        });

        this.socket.on('error', (error) => {
            this.emit('error', error);
        });

        this.socket.on('close', (hadError) => {
            this.emit('close', hadError);
        });

        this.socket.on('connect', () => {
            this.emit('connect');
        });

        this.socket.connect(address.port, address.address);
    }

    connect() {
        RinnaiTouchUdpConnection.getAddress((address, error) => {
            if (error) {
                this.emit('error', error);
            } else {
                this._createConnection(address);
            }
        });   
    }

    destroy() {
        if (this.socket) {
            this.socket.destroy();
            //this.emit('close'); Is this needed?
        }  
    }

    write(data, callback) {
        if (this.socket) {
            this.socket.write(data, (error) => {
                if (callback && typeof callback === "function") {
                    callback(error);
                }
            });
        } else {
            if (callback && typeof callback === "function") {
                callback(new Error('No TCP Connection'));
            }
        }
    }
}

module.exports = RinnaiTouchTcpConnection;