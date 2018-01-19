import $ from "properjs-hobo";



const alert = {
    init () {
        this.alertBox = $( ".js-hud-alert" );
        this.alertMsg = this.alertBox.find( ".js-hud-alert-msg" );
        this.queue = [];
        this.isFlashing = false;
        this.timeout = false;
        this.duration = 8000;

        return this;
    },

    push ( data ) {
        this.queue.push( data );

        if ( !this.isFlashing ) {
            this.fire( data );
        }
    },

    fire () {
        this.isFlashing = true;

        const queueData = this.queue.pop();

        this.alertMsg[ 0 ].innerHTML = queueData.alertHtml;
        this.alertBox.addClass( "is-active" );
        this.timeout = setTimeout(() => {
            alert.alertBox.removeClass( "is-active" );

            alert.timeout = setTimeout(() => {
                if ( alert.queue.length ) {
                    alert.fire();

                } else {
                    alert.isFlashing = false;
                }

            }, 200 );

        }, this.duration );
    }
};



export default alert;
