'use strict';
let config = require("./.config.json");
async function interval_function(){
    let ec2metadata = runCommand({value: "ec2metadata"}).split("\n");
    let server_name = config.name +"->"+ ec2metadata.filter(x=>x.match(/local-ipv4/))[0].split(":")[1];
    config.syscommands.forEach(async x=>{
        let data = runCommand(x);
        await senddata({data, server_name, command_name: x.name, formatter: x.formatter});
    });

    await senddata({data: ec2metadata, server_name, command_name: config.name, formatter: "ec2metadata"});
}

function runCommand(command){
        const { execSync } = require( 'child_process' );
        return execSync( command.value ).toString();
}

async function senddata(message){
    const dgram = require('dgram');
    console.log(message.command_name)
    message = Buffer.from( JSON.stringify(message));
        const client = dgram.createSocket('udp4');
    await client.send(message, 41234, config.host||"localhost", (err) => {
        client.close();
    });
}
setInterval(interval_function, config.interval);
interval_function();

process.on("SIGINT",async function(){
    try{
        config.syscommands.unshift({
            "name": "pm2 logs shutdown",
            "value":"pm2 logs --nostream --lines=100",
            "formatter": "pm2_log"
        })
        await interval_function();
    } finally{
        setTimeout(x=>{
            process.exit(0);
        }, 500)
    }
});