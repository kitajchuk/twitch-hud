import $ from "properjs-hobo";



const alert = {
    init () {
        this.alertBox = $( ".js-hud-alert" );
        this.alertMsg = this.alertBox.find( ".js-hud-alert-msg" );
        this.queue = [];
        this.isFlashing = false;
        this.timeout = false;
        this.duration = 5000;

        return this;
    },

    push ( data ) {
        this.queue.push( data );

        if ( !this.isFlashing ) {
            this.fire();
        }
    },

    fire () {
        this.isFlashing = true;

        // Since we `push` onto the bottom of the stack we pull from the top
        const queueData = this.queue.shift();

        this.alertMsg[ 0 ].innerHTML = queueData.alertHtml;
        this.alertBox.addClass( "is-active" );
        this.timeout = setTimeout(() => {
            this.hide();

        }, this.duration );
    },

    show ( data ) {
        this.isFlashing = false;
        this.alertMsg[ 0 ].innerHTML = data.alertHtml;
        this.alertBox.addClass( "is-active" );
    },

    hide () {
        this.alertBox.removeClass( "is-active" );

        this.timeout = setTimeout(() => {
            if ( this.queue.length ) {
                this.fire();

            } else {
                this.isFlashing = false;
            }

        }, 200 );
    }
};



export default alert;
