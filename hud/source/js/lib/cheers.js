import $ from "properjs-hobo";



const cheers = {
    init () {
        this.cheersBox = $( ".js-hud-cheer" );
        this.data = null;

        return this;
    },

    render () {
        this.cheersBox[ 0 ].innerHTML = `Top Cheer: <span style="color:${this.data.color};">${this.data.bits}</span> by <span style="color:${this.data.color};">${this.data.username}</span>`;

        console.log( this.data.tags );
    },

    pipe ( data ) {
        this.data = data;
        this.render();
    }
};



export default cheers;
