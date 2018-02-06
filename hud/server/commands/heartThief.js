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

            if ( !this.app.hasStats( userstate.username ) ) {
                this.app.setStatUser( userstate.username, "hearts" );

            } else {
                this.app.hitStatUser( userstate.username, "hearts" );
            }

            this.app.broadcast( "alert", {
                audioHit: "scream1",
                alertHtml: this.app.alerts.heartThief( userstate, num )
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

            this.app.broadcast( "alert", {
                audioHit: "scream2",
                alertHtml: this.app.alerts.heartCounter()
            });

            this.app.broadcast( "hearts", {
                hearts: this.app.data.hearts
            });

            this.tick();

        }, this.timeRun );
    }
};
