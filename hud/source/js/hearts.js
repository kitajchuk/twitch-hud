import $ from "properjs-hobo";
import socket from "./socket";
import heartsView from "./views/hearts";



const hearts = {
    init () {
        this.heartBox = $( ".js-hud-hearts" );
        this.data = null;

        socket.emit( "hearts" );

        return this;
    },

    render () {
        this.heartBox[ 0 ].innerHTML = heartsView( this.data );
    },

    pipe ( data ) {
        this.data = data;

        this.render();
    }
};



export default hearts;
