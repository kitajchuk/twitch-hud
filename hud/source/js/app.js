// Load the SASS
require( "../sass/app.scss" );



// Load the JS
import socket from "./socket";



// Global {app}
window.app = {};
window.app.socket = socket.init( window.app );
