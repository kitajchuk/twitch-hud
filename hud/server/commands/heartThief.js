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
    name: "heartThief",
    regex: /^\!ht$/,
    memo: {},
    init ( app ) {
        this.app = app;

        this.app.lager.template( `[${this.name}] command initialized` );
    },
    exec ( client, bot, channel, userstate, message, self, tmi ) {
        this.app.runCommand( this.name, message ).then(( response ) => {
            const num = 1;

            this.app.data.hearts.value -= num;
            this.app.data.hearts.value = this.app.data.hearts.value < 0 ? 0 : this.app.data.hearts.value;

            const alertHtml = `
                <h1 class="red">Heart Thief</h1>
                <p><span class="blue">${userstate.username}</span> appears to be an acolyte of Ganon and has stolen <span class="blue">${num}</span> of your hearts! You only have <span class="blue">${this.app.data.hearts.value}</span> ${this.app.data.hearts.value > 1 ? "hearts" : "heart"} left so be careful&hellip;</p>
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
