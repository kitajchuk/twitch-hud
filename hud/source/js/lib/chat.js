import $ from "properjs-hobo";



const chat = {
    init () {
        this.chatBox = $( ".js-hud-chat" );
        this.data = {};

        return this;
    },

    pipe ( key, value ) {
        this.data[ key ] = value;

        console.log( this );
    }
};



export default chat;
