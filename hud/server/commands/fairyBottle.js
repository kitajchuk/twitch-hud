"use strict";



/**
 *
 *
 * Fairy Bottle
 * Give hearts back to LifeMeter
 *
 *
 */
module.exports = {
    name: "fairyBottle",
    regex: /^\!fb\s(.*?)$/,
    memo: {},
    init ( app ) {
        this.app = app;

        this.app.lager.template( `[${this.name}] command initialized` );
    },
    exec ( client, bot, channel, userstate, message, self, tmi ) {
        this.app.runCommand( this.name, message ).then(( response ) => {
            const num = parseInt( response.match[ 1 ], 10 );

            this.app.data.hearts.value += num;
            this.app.data.hearts.value = this.app.data.hearts.value > this.app.data.hearts.max ? this.app.data.hearts.max : this.app.data.hearts.value;

            const alertHtml = `
            <h1 class="fb">Fairy Bottle</h1>
            <p><span class="bk">${userstate.username}</span> gave you a fairy in a bottle worth <span class="bk">${num}</span> ${num > 1 ? "hearts" : "heart"}! You now have <span class="bk">${this.app.data.hearts.value}</span> whole hearts!</p>
            `;

            this.app.broadcast( "alert", {
                alertHtml: alertHtml
            });

            this.app.broadcast( "hearts", {
                hearts: this.app.data.hearts
            });
        });
    }
};
