import $ from "properjs-hobo";
import utils from "./utils";



const hearts = {
    init () {
        this.heartBox = $( ".js-hud-hearts" );
        this.heartCounter = $( ".js-hud-heart-counter" );
        this.hearts = null;
        this.data = null;

        return this;
    },

    render () {
        const html = [];

        while ( html.length < this.data.hearts.max ) {
            html.push(`
                <div class="hud__hearts__container js-hud-hearts-container">
                    <span></span>
                </div>
            `);
        }

        this.heartBox[ 0 ].innerHTML = html.join( "" );
        this.hearts = this.heartBox.find( ".js-hud-hearts-container" );
    },

    counter ( data ) {
        this.heartCounter[ 0 ].innerHTML = `<span class="red">${utils.formatTime( data.time )}</span>`;
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
