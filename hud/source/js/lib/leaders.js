import $ from "properjs-hobo";



const leaders = {
    init () {
        this.leadersBox = $( ".js-hud-leaders" );
        this.data = null;

        return this;
    },

    render () {
        const html = this.data.map(( stat ) => {
            return `<div class="${stat.color}">${stat.username}: ${stat.value}</div>`;

        }).join( "" );

        this.leadersBox[ 0 ].innerHTML = html || "Leaders have been<br />reset. Let's play!";
    },

    pipe ( data ) {
        this.data = data;
        this.render();
    }
};



export default leaders;
