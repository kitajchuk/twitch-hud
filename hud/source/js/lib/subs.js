import $ from "properjs-hobo";



const subs = {
    init () {
        this.subsBox = $( ".js-hud-subs" );
        this.data = null;

        return this;
    },

    render () {
        this.subsBox[ 0 ].innerHTML = this.data.map(( username ) => {
            return `<div class="">${username}</div>`;

        }).join( "" );
    },

    pipe ( data ) {
        this.data = data;
        this.render();
    }
};



export default subs;
