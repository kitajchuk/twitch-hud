import $ from "properjs-hobo";



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
    }
};



export default cheers;
