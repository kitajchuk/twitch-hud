import $ from "properjs-hobo";
import Tween from "properjs-tween";
// import Easing from "properjs-easing";
import audio from "./audio";



const cheers = {
    init () {
        this.cheersBox = $( ".js-hud-cheer" );
        this.data = null;

        return this;
    },

    render () {
        this.cheersBox[ 0 ].innerHTML = `<span class="purple">${this.data.bits}</span> bits by <span class="teal">${this.data.username}</span>`;
    },

    pipe ( data ) {
        this.data = data;
        this.render();
    },

    swap ( data ) {
        const spans = this.cheersBox.find( "span" );
        const duration = ((data.bits - this.data.bits) / 20) * 1000;

        spans.last()[ 0 ].innerHTML = data.username;

        this.tween = new Tween({
            from: this.data.bits,
            to: data.bits,
            duration,
            update: ( bit ) => {
                spans.first()[ 0 ].innerHTML = Math.round( bit );
                audio.hit( "rupeeChange" );
            },
            complete: ( bit ) => {
                spans.first()[ 0 ].innerHTML = Math.round( bit );
                audio.hit( "rupeeChangeDone" );
                this.data = data;
            }
        });
    }
};



export default cheers;
