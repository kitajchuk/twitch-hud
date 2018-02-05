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
        this.timeout = null;
        this.interval = null;
        this.pubTime = 0;
        this.timeRun = 600000; // 10 minutes in milliseconds

        this.app.lager.template( `[${this.name}] command initialized` );
    },
    exec ( client, bot, channel, userstate, message, self, tmi ) {
        this.app.runCommand( this.name, message ).then(( response ) => {
            const num = 1;

            this.app.data.hearts.value -= num;
            this.app.data.hearts.value = this.app.data.hearts.value < 0 ? 0 : this.app.data.hearts.value;

            const alertHtml = `
                <h1 class="red">Heart Thief</h1>
                <p><span class="blue">${userstate.username}</span> has stolen <span class="blue">${num}</span> of your hearts! You only have <span class="blue">${this.app.data.hearts.value}</span> ${this.app.data.hearts.value > 1 ? "hearts" : "heart"} left&hellip;</p>
            `;
            const statUser = this.app.getStats( userstate.username );

            if ( !statUser ) {
                this.app.stats.push({
                    username: userstate.username,
                    fairies: 0,
                    hearts: 1,
                    bottles: 0,
                    mazes: 0
                });

            } else {
                statUser.hearts++;
                this.app.saveStats( userstate.username );
            }

            this.app.broadcast( "alert", {
                audioHit: "scream1",
                alertHtml
            });

            this.app.broadcast( "hearts", {
                hearts: this.app.data.hearts
            });

            this.app.leaders();
        });
    },
    stop () {
        if ( this.timeout ) {
            clearTimeout( this.timeout );
        }

        if ( this.interval ) {
            clearTimeout( this.interval );
        }

        this.app.broadcast( "heartCounter", {
            time: 0
        });
    },
    tick () {
        if ( this.timeout ) {
            clearTimeout( this.timeout );
        }

        if ( this.interval ) {
            clearTimeout( this.interval );
        }

        const timeHit = Date.now();

        this.interval = setInterval(() => {
            const timeNow = Date.now();

            this.app.broadcast( "heartCounter", {
                time: this.timeRun - (timeNow - timeHit)
            });

        }, this.pubTime );

        this.timeout = setTimeout(() => {
            const num = 1;

            this.app.data.hearts.value -= num;
            this.app.data.hearts.value = this.app.data.hearts.value < 0 ? 0 : this.app.data.hearts.value;

            const alertHtml = `
                <h1 class="red">Heart Timeout</h1>
                <p>Has it been 10 minutes already!? You lost one of your hearts! You only have <span class="blue">${this.app.data.hearts.value}</span> ${this.app.data.hearts.value > 1 ? "hearts" : "heart"} left&hellip;</p>
            `;

            this.app.broadcast( "alert", {
                audioHit: "scream2",
                alertHtml: alertHtml
            });

            this.app.broadcast( "hearts", {
                hearts: this.app.data.hearts
            });

            this.tick();

        }, this.timeRun );
    }
};
