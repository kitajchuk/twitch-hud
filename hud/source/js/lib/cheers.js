import $ from "properjs-hobo";
import Tween from "properjs-tween";
import Easing from "properjs-easing";



const cheers = {
    init () {
        this.cheersBox = $( ".js-hud-cheer" );
        this.data = null;

        return this;
    },

    render () {
        this.cheersBox[ 0 ].innerHTML = `<span class="yellow">${this.data.bits}</span> by <span class="yellow">${this.data.username}</span>`;
    },

    pipe ( data ) {
        this.data = data;
        this.render();
    },

    swap ( data ) {
        const spans = this.cheersBox.find( "span" );

        spans.last()[ 0 ].innerHTML = data.username;

        this.tween = new Tween({
            from: this.data.bits,
            to: data.bits,
            ease: Easing.easeOutQuad,
            duration: 3000,
            update: ( bit ) => {
                spans.first()[ 0 ].innerHTML = Math.round( bit );
            },
            complete: ( bit ) => {
                spans.first()[ 0 ].innerHTML = Math.round( bit );

                this.data = data;
            }
        });
    }
};



export default cheers;
