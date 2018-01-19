const child_process = require( "child_process" );


// 1.0 Stop `environment` server
console.log( `Stopping HUB server...` );

child_process.execSync( "npm run hub:stop" );


// 2.0 Make sure ports are forwarded for node
console.log( `Forwarding port 80 to port 8000...` );

child_process.execSync( "iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000" );


// 3.0 Start `environment` server
console.log( `Starting HUB server...` );

child_process.execSync( `npm run hub:start` );
