import $ from "properjs-hobo";
// import socket from "./socket";



const follows = {
    init () {
        this.followsBox = $( ".js-hud-follows" );
        this.data = null;

        return this;
    },

    render () {
        this.followsBox[ 0 ].innerHTML = this.data.map(( username ) => {
            return `<div class="">${username}</div>`;

        }).join( "" );
    },

    pipe ( data ) {
        this.data = data;
        this.render();
    }
};



export default follows;
