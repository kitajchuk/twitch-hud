import $ from "properjs-hobo";
import socket from "./socket";
import heartsView from "./views/hearts";



const hearts = {
    init () {
        this.heartBox = $( ".js-hud-hearts" );
        this.hearts = null;
        this.data = null;

        socket.emit( "hearts" );

        return this;
    },

    render () {
        this.heartBox[ 0 ].innerHTML = heartsView( this.data );
        this.hearts = this.heartBox.find( ".js-hud-hearts-container" );
    },

    pipe ( data ) {
        if ( !this.data ) {
            this.data = data;

            // console.log( "hearts", this.data );

            this.render();
            this.pipe( data );

        } else {
            this.data = data;

            const remaining = this.data.hearts.max - (this.data.hearts.max - this.data.hearts.value);

            // console.log( remaining );

            this.hearts.forEach(( heart, i ) => {
                if ( (i + 1) > remaining ) {
                    this.hearts.eq( i ).addClass( "slashed" );

                } else {
                    this.hearts.eq( i ).removeClass( "slashed" );
                }
            });
        }
    }
};



export default hearts;
