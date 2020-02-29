# RinnaiTouchClient
Node.js Client for connecting to a Rinnai Touch Module (aka Rinnai Touch Wi-Fi Kit). The client can emit status updates from the module as well as allow you to send commands. It will automatically determine the IP address and port of the module so no need to assign a static/reserved IP address to the module.

The main goal of this client is to reliably and easily control the Rinnai Touch Module.

# Known limitations
 - It currently only supports connection via TCP on the local network. No cloud connection via Azure Hub.
 - If any other client (eg. TouchApp on iPhone) is connected then the RinnaiTouchClient will not be able to connect and emit an error after about 5 seconds
 - **Allows close the connection!**  If the client's connection is not explicitly closed then the Rinnai Touch Module may no longer allow TCP connections. I encountered this several times and the only way to clear it was to restart my router. Restarting the module itself may also work but mine is located in the roof cavity so easier to restart the router.
 - This is still a work in progress so may have a few bugs. Please let me know of any bugs or features you'd like added.
 - I don't have an Evaporative Cooling system so I couldn't test that part of the Module
 - This is my first time coding in node.js so apologies if I'm not adhering to it's standards. 

# Documentation
### Methods
- **createClient([callback([client][, error])])**
Static method that creates an instance of the client. It will attempt to establish a connection to the module. The callback function is executed when the connection is ready to accept commands or an error occurred.
- **close([callback])**
Closes the TCP connection. It's important this is called to ensure the connection is not left open.  The callback function is called once the connection is closed.
- **send(command[, callback([error])])**
Sends a command to the module. See Command Keys & Values section for more details. The callback function is called once the command has been successfully sent or an error occurs.
### Properties
- **status**
The current status from the Module
- **connection**
The TCP connection to the Module
### Events
 - **ready**
 Emitted when connected to Module and ready to accept commands
 - **close**
 Emitted when the connection to the Module has been closed
 - **error**
 Emitted when an error occurs. Includes error object
 - **statusChanged**
 Emitted when the Module's status has changed. Includes status as json string.
 - **commandSent**
 Emitted when a command has been sent successfully.

# Command Keys & Values
Commands to be sent to the Module must be in the following format:

    {key: "value"}     eg. {Mode: "Cool"}

The following is a list of all the command keys and their allowed values.
|Key|Description|Values|
|--|--|--|
|Mode|Sets the system mode|Heat, Cool, Evap|
|HeatState|Set Heating state|On, Off, Fan|
|HeatFanSpeed|Sets fan speed when HeatState = Fan|01 - 16|
|HeatOperation|Set to Automatic (ie. schedule) or Manual|Auto, Manual|
|HeatTemp|Set Temperature (in Celcius)|08 - 30|
|HeatAutoMode|Set Automatic mode|Now, Advance, Override|
|HeatZoneA|Enable Zone A|Yes, No|
|HeatZoneB|Enable Zone B|Yes, No|
|HeatZoneC|Enable Zone C|Yes, No|
|HeatZoneD|Enable Zone D|Yes, No|
|CoolState|Set Cooling state|On, Off, Fan|
|CoolFanSpeed|Sets fan speed when CoolState = Fan|01 - 16|
|CoolOperation|Set to Automatic (ie. schedule) or Manual|Auto, Manual|
|CoolTemp|Set Temperature (in Celcius)|08 - 30|
|CoolAutoMode|Set Automatic mode|Now, Advance, Override|
|CoolZoneA|Enable Zone A|Yes, No|
|CoolZoneB|Enable Zone B|Yes, No|
|CoolZoneC|Enable Zone C|Yes, No|
|CoolZoneD|Enable Zone D|Yes, No|
|EvapState|Set Evaporative Cooling state|On, Off|
|EvapPump|Switch pump on or off|On, Off|
|EvapFan|Switch fan on or off|On, Off|
|EvapSpeed|Set Fan Speed|01 - 16|



# How to use
To use the RinnaiTouchClient class in your own app/project include it with the require function. eg.

    var RinnaiTouchClient = require('./RinnaiTouchClient');

The class supports both callbacks and events.

Callback example - Set Rinnai to "Cooling" mode:

    RinnaiTouchClient.createClient((client) => {
        client.send({Mode: "Cool"}, () => {
            client.close();
        });
    });

Event example - Set Rinnai to "Heating" mode:

    var client = RinnaiTouchClient.createClient();
    client.on('ready', () => {
        client.send({Mode: "Heat"});
    });
    client.on('commandSent', () => {
        client.close();
    });

# Files

### Core Library

The Core Library contains the classes required to connect to and control the Rinnai Touch Module

 - **RinnaiTouchClient.js**
Contains the main class for connecting to the Module. It controls the connection as well as receiving status and sending commands.
 - **RinnaiTouchUdpConnection.js**
A helper class used to obtain the IP address and port of the Module.
- **RinnaiTouchTcpConnection.js**
A helper class used to manage the TCP connection to the Module.

### Demo - Simple Command Line tool

- **Rinnai.js**
This Rinnai command line tool allows you to return the status and send commands to a Rinnai Touch Module from the command prompt.

Command line format:

 

    > node Rinnai [key value]

eg. To use the command line tool to retrieve the Module status execute without any parameters:

    > node Rinnai
    Connected: 192.168.1.3:27847
    [{"SYST": {"CFG": {"MTSP": "N", "NC": "00", "DF": "N", "TU": "C", "CF": "1", "VR": "0183", "CV": "0010", "CC": "043", "ZA": "Bedrooms        ", "ZB": "Living Areas    ", "ZC": "                ", "ZD": "                " }, "AVM": {"HG": "Y", "EC": "N", "CG": "Y", "RA": "N", "RH": "N", "RC": "N" }, "OSS": {"DY": "SAT", "TM": "12:27", "BP": "Y", "RG": "Y", "ST": "N", "MD": "H", "DE": "N", "DU": "N", "AT": "999", "LO": "N" }, "FLT": {"AV": "N", "C3": "000" } } },{"HGOM": {"CFG": {"ZUIS": "N", "ZAIS": "Y", "ZBIS": "Y", "ZCIS": "N", "ZDIS": "N", "CF": "N", "PS": "Y", "DG": "W" }, "OOP": {"ST": "N", "CF": "N", "FL": "08", "SN": "N" }, "GSO": {"OP": "A", "SP": "22", "AO": "N" }, "GSS": {"HC": "N", "FS": "N", "GV": "N", "PH": "N", "AT": "L", "AZ": "R" }, "APS": {"AV": "N" }, "ZUO": {"UE": "N" }, "ZAO": {"UE": "Y" }, "ZBO": {"UE": "Y" }, "ZCO": {"UE": "N" }, "ZDO": {"UE": "N" }, "ZUS": {"AE": "N", "MT": "235" }, "ZAS": {"AE": "N", "MT": "235" }, "ZBS": {"AE": "N", "MT": "235" }, "ZCS": {"AE": "N", "MT": "235" }, "ZDS": {"AE": "N", "MT": "235" } } }]
    Connection Closed

eg. To set Heating temperature to 22 degrees supply a command key and value:

    > node Rinnai HeatTemp 22
    Connected: 192.168.1.3:27847
    Command sent
    Connection Closed

### Demo - Simple REST API
- **RinnaiRest.js** 
This REST API runs on port 8080 of the host and can be accessed from any browser. It will display the current status of the Module if nothing is specified on the URL, otherwise, it will send the command as specified on the URL.

URL format:



    http://localhost:8080/[key/value]

eg. To retrieve the current status

    http://localhost:8080/

eg. To set Heating temperature to 22 degrees

    http://localhost:8080/HeatTemp/22