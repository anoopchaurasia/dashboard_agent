'use strict';
let config = require("./.config.json");
console.log(config);
async function interval_function(){
    console.log("ssdsd")
    config.syscommands.forEach(async x=>{
        let data = await runCommand(x);
        console.log(data.toString(), x)
        senddata(data);
    });
    senddata(process.memoryUsage());
}

function runCommand(command){
    return new Promise((r, e)=> {
        console.log(command)
        const { spawn } = require( 'child_process' );
        const ls = spawn( command.command, command.args );

        ls.stdout.on( 'data', data => {
            r(data);
        } );

        ls.stderr.on( 'data', data => {
            e();
        } );
        ls.on( 'close', code => {
            console.log( `child process exited with code ${code}` );
        } );
    });
}


function senddata(message){
    const dgram = require('dgram');
 //   const message = Buffer.from(data);
    const client = dgram.createSocket('udp4');
    client.send(message, 41234, 'localhost', (err) => {
        client.close();
    });
}
setInterval(interval_function, config.interval);
interval_function();