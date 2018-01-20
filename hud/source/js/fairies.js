import $ from "properjs-hobo";
import socket from "./socket";
import fairiesView from "./views/fairies";



const fairies = {
    init () {
        this.fairyBox = $( ".js-hud-fairies" );
        this.data = null;

        socket.emit( "fairies" );

        return this;
    },

    render () {
        this.fairyBox[ 0 ].innerHTML = fairiesView( this.data );
    },

    pipe ( data ) {
        this.data = data;

        this.render();
    }
};



export default fairies;
