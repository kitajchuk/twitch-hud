"use strict";



/**
 *
 *
 * Heart Slash
 * Slash hearts from LifeMeter
 *
 *
 */
module.exports = {
    name: "slashHeart",
    regex: /^\!sh\s(.*?)$/,
    memo: {},
    init ( app ) {
        this.app = app;

        this.app.lager.template( `[${this.name}] command initialized` );
    },
    exec ( client, bot, channel, userstate, message, self, tmi ) {
        this.app.runCommand( this.name, message ).then(( response ) => {
            const num = parseInt( response.match[ 1 ], 10 );

            this.app.data.hearts.value -= num;
            this.app.data.hearts.value = this.app.data.hearts.value < 0 ? 0 : this.app.data.hearts.value;

            const alertHtml = `
                <h1 class="ht">Slash Hearts</h1>
                <p><span class="bk">${userstate.username}</span> slashed <span class="bk">${num}</span> of your hearts! You only have <span class="bk">${this.app.data.hearts.value}</span> ${this.app.data.hearts.value > 1 ? "hearts" : "heart"} left!</p>
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
