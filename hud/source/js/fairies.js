import $ from "properjs-hobo";
import socket from "./socket";
import fairiesView from "./views/fairies";



const fairies = {
    init () {
        this.fairyBox = $( ".js-hud-fairies" );
        this.fairyCounter = $( ".js-hud-fairy-counter" );
        this.fairies = null;
        this.data = null;
        this.last = null;

        socket.emit( "fairies" );

        return this;
    },

    render () {
        this.fairyBox[ 0 ].innerHTML = fairiesView( this.data );
    },

    formatTime ( time ) {
        const minutes = parseInt( time / (1000 * 60), 10 );
        let seconds = parseInt( time / 1000, 10) % 60;

        if ( seconds < 10 ) {
            seconds = `0${seconds}`;
        }

        return `${minutes}:${seconds}`;
    },

    counter ( data ) {
        this.fairyCounter[ 0 ].innerHTML = `${this.formatTime( data.time )} <span>${data.message}</span>`;
    },

    pipe ( data ) {
        if ( !this.data ) {
            this.data = data;

            console.log( "fairies", this.data );

            this.render();
            this.pipe( data );

        } else {
            this.last = this.data;
            this.data = data;

            // remove .found
            // add .found for diff between max and value

            // if ( this.data.fairies.value === this.last.fairies.value ) {
            //     console.log( "Fairy miss!" );
            //
            // // Lose 1 fairy bottle
            // } else if ( this.data.fairies.value < this.last.fairies.value ) {
            //     this.fairies = this.fairyBox.find( ".js-hud-fairies-container" ).is( ".found" );
            //     this.fairies.first().removeClass( "found" );
            //
            // // Gain 1 fairy bottle
            // } else {
            //     this.fairies = this.fairyBox.find( ".js-hud-fairies-container" ).not( ".found" );
            //     this.fairies.last().addClass( "found" );
            // }
        }
    }
};



export default fairies;
