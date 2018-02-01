import $ from "properjs-hobo";



const leaders = {
    init () {
        this.leadersBox = $( ".js-hud-leaders" );
        this.data = null;

        return this;
    },

    render () {
        this.leadersBox[ 0 ].innerHTML = this.data.map(( stat ) => {
            return `<div class="">${stat.username} <span class="${stat.color}">${stat.value}</span></div>`;

        }).join( "" );
    },

    pipe ( data ) {
        this.data = data;
        this.render();
    }
};



export default leaders;
