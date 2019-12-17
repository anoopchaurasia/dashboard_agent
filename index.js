'use strict';
let config = require("./.config.json");
async function interval_function(){
    config.syscommands.forEach(async x=>{
        let data = await runCommand(x);
        console.log(data, x);
        senddata({data, server_name:config.name, command_name: x.name, formatter: x.formatter});
    });
    senddata({data: process.memoryUsage(), server_name:config.name, command_name: config.name, formatter: config.formatter});
}

function runCommand(command){
        console.log(command)
        const { execSync } = require( 'child_process' );
        return execSync( command.value ).toString();
}

function senddata(message){
    const dgram = require('dgram');
    message = Buffer.from( JSON.stringify(message));
    const client = dgram.createSocket('udp4');
    client.send(message, 41234, config.host||"localhost", (err) => {
        client.close();
    });
}
setInterval(interval_function, config.interval);
interval_function();