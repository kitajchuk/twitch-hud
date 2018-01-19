import $ from "properjs-hobo";
import socket from "./socket";



const chat = {
    init () {
        this.chatBox = $( ".js-hud-chat" );
        this.data = {};

        socket.emit( "badges" );
        socket.emit( "emotes" );

        return this;
    },

    pipe ( key, value ) {
        this.data[ key ] = value;

        console.log( this );
    }
};



export default chat;
