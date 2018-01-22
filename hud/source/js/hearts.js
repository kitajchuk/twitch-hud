import $ from "properjs-hobo";
import socket from "./socket";
import heartsView from "./views/hearts";



const hearts = {
    init () {
        this.heartBox = $( ".js-hud-hearts" );
        this.hearts = null;
        this.data = null;
        this.last = null;

        socket.emit( "hearts" );

        return this;
    },

    render () {
        this.heartBox[ 0 ].innerHTML = heartsView( this.data );
    },

    pipe ( data ) {
        if ( !this.data ) {
            this.data = data;

            console.log( "hearts", this.data );

            this.render();
            this.pipe( data );

        } else {
            this.last = this.data;
            this.data = data;

            // remove .slashed
            // add .slashed for diff between max and value

            // if ( this.data.hearts.value === this.last.hearts.value ) {
            //     console.log( "Heart miss!" );
            //
            // // Lose 1 heart container
            // } else if ( this.data.hearts.value < this.last.hearts.value ) {
            //     this.hearts = this.heartBox.find( ".js-hud-hearts-container" ).not( ".slashed" );
            //     this.hearts.last().addClass( "slashed" );
            //
            // // Gain 1 heart container
            // } else {
            //     this.hearts = this.heartBox.find( ".js-hud-hearts-container" ).is( ".slashed" );
            //     this.hearts.last().removeClass( "slashed" );
            // }
        }
    }
};



export default hearts;
