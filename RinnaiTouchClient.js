const RinnaiTouchTcpConnection = require('./RinnaiTouchTcpConnection');
const EventEmmitter = require('events');

class RinnaiTouchClient extends EventEmmitter {
    constructor() {
        super();
        this.status = undefined;
        this.connection = undefined;
    }

    static createClient(callback) {
        var self = new RinnaiTouchClient();
        self.connection = new RinnaiTouchTcpConnection();
        self.connection.on('ready', () => {
            self.emit('ready');
            if (callback && typeof callback === "function") {
                callback(self);
            }
        });
        self.connection.on('error', (error) => {
            self.emit('error', error);
            if (callback && typeof callback === "function") {
                callback(self, error);
            }
        });
        self.connection.on('status', (status) => {
            if (self.status !== status) {
                self.status = status;
                self.emit('statusChanged', status);
            }
        });
        self.connection.connect();
        return self;
    }

    close(callback) {
        if (this.connection) {
            this.connection.destroy();
        }
        this.emit('close');
        if (callback && typeof callback === "function") {
            callback();
        }
    }

    send(command, callback) {
        var data = this._transformCommand(command);
        this.connection.write(data, (error) => {
            if (error) {
                this.emit('error', error);
                callback(error);
            } else {
                this.emit('commandSent');
                if (callback && typeof callback === "function") {
                    callback();
                }
            }
        });
    }

    _transformCommand(command) {
        var commandTypes = this._commandTypes();
        var commandType = Object.keys(command)[0];
        if (!(commandType in commandTypes)) {
            return '';
        }
        
        var value = command[commandType];
        if (commandTypes[commandType].values && value in commandTypes[commandType].values) {
            value = commandTypes[commandType].values[value];
        }

        var keys = commandTypes[commandType].keys;
        return `N000001{"${keys[0]}":{"${keys[1]}":{"${keys[2]}":"${value}"}}}`;
    }

    _commandTypes() {
        return {
            // System
            Mode: {
                keys: ["SYST", "OSS", "MD"],
                values: {Heat: 'H', Cool: 'C', Evap: 'E'}
            },
            // Heating
            HeatState: {
                keys: ["HGOM", "OOP", "ST"],
                values: {On: 'N', Off: 'F', Fan: 'Z'}
            },
            HeatFanSpeed: {
                keys: ["HGOM", "OOP", "FL"]
                // values: 01 - 16
            },
            HeatOperation: {
                keys: ["HGOM", "GSO", "OP"],
                values: {Auto: "A", Manual: "M"}
            },
            HeatTemp: {
                keys: ["HGOM", "GSO", "SP"],
                // values 08 - 30
            },
            HeatAutoMode: {
                keys: ["HGOM", "GSO", "AO"],
                values: {Now: "N", Advance: "A", Override: "O"}
            },
            HeatZoneA: {
                keys: ["HGOM", "ZAO", "UE"],
                values: {Yes: "Y", No: "N"}
            },
            HeatZoneB: {
                keys: ["HGOM", "ZBO", "UE"],
                values: {Yes: "Y", No: "N"}
            },
            HeatZoneC: {
                keys: ["HGOM", "ZCO", "UE"],
                values: {Yes: "Y", No: "N"}
            },
            HeatZoneD: {
                keys: ["HGOM", "ZDO", "UE"],
                values: {Yes: "Y", No: "N"}
            },            
            // Cooling
            CoolState: {
                keys: ["CGOM", "OOP", "ST"],
                values: {On: 'N', Off: 'F', Fan: 'Z'}
            },
            CoolFanSpeed: {
                keys: ["CGOM", "OOP", "FL"]
                // values: 01 - 16
            },
            CoolOperation: {
                keys: ["CGOM", "GSO", "OP"],
                values: {Auto: "A", Manual: "M"}
            },
            CoolTemp: {
                keys: ["CGOM", "GSO", "SP"],
                // values 08 - 30
            },
            CoolAutoMode: {
                keys: ["CGOM", "GSO", "AO"],
                values: {Now: "N", Advance: "A", Override: "O"}
            },
            CoolZoneA: {
                keys: ["CGOM", "ZAO", "UE"],
                values: {Yes: "Y", No: "N"}
            },
            CoolZoneB: {
                keys: ["CGOM", "ZBO", "UE"],
                values: {Yes: "Y", No: "N"}
            },
            CoolZoneC: {
                keys: ["CGOM", "ZCO", "UE"],
                values: {Yes: "Y", No: "N"}
            },
            CoolZoneD: {
                keys: ["CGOM", "ZDO", "UE"],
                values: {Yes: "Y", No: "N"}
            },
            // Evaporative
            EvapState: { 
                keys: ["ECOM", "GSO", "SW"],
                values: {On: "N", Off: "F"}
            },
            EvapPump: {
                keys: ["ECOM", "GSO", "PS"],
                values: {On: "N", Off: "F"}
            },
            EvapFan: {
                keys: ["ECOM", "GSO", "FS"],
                values: {On: "N", Off: "F"}
            },
            EvapSpeed: {
                keys: ["ECOM", "GSO", "FL"]
                // values: 01 - 16
            }
        };
    }
}

module.exports = RinnaiTouchClient;