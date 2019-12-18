'use strict';
let config = require("./.config.json");
async function interval_function(){
        console.log("dfdf")
    let ec2metadata = runCommand({value: "ec2metadata"}).split("\n");
    let server_name = config.name +"->"+ ec2metadata.filter(x=>x.match(/local-ipv4/))[0].split(":")[1];
    config.syscommands.forEach(async x=>{
        let data = runCommand(x);
        senddata({data, server_name, command_name: x.name, formatter: x.formatter});
    });

    senddata({data: ec2metadata, server_name, command_name: config.name, formatter: "ec2metadata"});
}

function runCommand(command){
        const { execSync } = require( 'child_process' );
        return execSync( command.value ).toString();
}

function senddata(message){
    const dgram = require('dgram');
console.log(message.command_name)
    message = Buffer.from( JSON.stringify(message));
        const client = dgram.createSocket('udp4');
    client.send(message, 41234, config.host||"localhost", (err) => {
        client.close();
    });
}
setInterval(interval_function, config.interval);
interval_function();