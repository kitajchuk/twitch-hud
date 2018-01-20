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
    regex: /^\!fb$/,
    memo: {},
    init ( app ) {
        this.app = app;

        this.app.lager.template( `[${this.name}] command initialized` );
    },
    exec ( client, bot, channel, userstate, message, self, tmi ) {
        this.app.runCommand( this.name, message ).then(( response ) => {
            // const num = parseInt( response.match[ 1 ], 10 );
            //
            // this.app.data.hearts.value += num;
            // this.app.data.hearts.value = this.app.data.hearts.value > this.app.data.hearts.max ? this.app.data.hearts.max : this.app.data.hearts.value;

            if ( this.app.data.fairies.value === 0 ) {
                const alertHtml = `
                    <h1 class="pink">False Fairy</h1>
                    <p><span class="blue">${userstate.username}</span> thinks they can use fairies any old time they like? Use the <span class="blue mono">!ff</span> command so you can catch some first&hellip;</p>
                `;

                this.app.broadcast( "alert", {
                    alertHtml: alertHtml
                });

            } else {
                const num = 1;

                this.app.data.hearts.value += num;

                const alertHtml = `
                    <h1 class="pink">Fairy Bottle</h1>
                    <p><span class="blue">${userstate.username}</span> appears to be a follower of the Great Fairies and gave you a fairy in a bottle worth <span class="blue">${num}</span> ${num > 1 ? "hearts" : "heart"}! You now have <span class="blue">${this.app.data.hearts.value}</span> whole hearts!</p>
                `;

                this.app.broadcast( "alert", {
                    alertHtml: alertHtml
                });

                this.app.broadcast( "hearts", {
                    hearts: this.app.data.hearts
                });
            }
        });
    }
};
