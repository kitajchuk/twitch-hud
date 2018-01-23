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
        this.fairies = this.fairyBox.find( ".js-hud-fairies-container" );
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

            // console.log( "fairies", this.data );

            this.render();
            this.pipe( data );

        } else {
            this.data = data;

            const remaining = this.data.fairies.max - this.data.fairies.value;

            // console.log( remaining );

            this.fairies.forEach(( fairy, i ) => {
                if ( (i + 1) > remaining ) {
                    this.fairies.eq( i ).addClass( "found" );

                } else {
                    this.fairies.eq( i ).removeClass( "found" );
                }
            });
        }
    }
};



export default fairies;
