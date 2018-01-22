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
    name: "fairyFinder",
    regex: /^\!ff$/,
    memo: {},
    init ( app ) {
        this.app = app;
        this.fairies = true;
        this.timeout = null;
        this.interval = null;
        this.minTime = 120000; // 2 minutes in milliseconds
        this.maxTime = 600000; // 10 minutes in milliseconds
        this.pubTime = 0;
        this.hitPercent = 75; // 25% hit rate
        this.maxHit = 100;
        this.minHit = 0;

        this.tick();

        this.app.lager.template( `[${this.name}] command initialized` );
    },
    exec ( client, bot, channel, userstate, message, self, tmi ) {
        this.app.runCommand( this.name, message ).then(( response ) => {
            if ( this.fairies ) {
                const hit = Math.floor( Math.random() * (this.maxHit - this.minHit + 1) ) + this.minHit;
                const num = 1;

                console.log( hit, hit > this.hitPercent );

                if ( hit > this.hitPercent ) {
                    this.app.data.fairies.value += num;
                    this.app.data.fairies.value = this.app.data.fairies.value > this.app.data.fairies.max ? this.app.data.fairies.max : this.app.data.fairies.value;

                    this.app.broadcast( "fairies", {
                        fairies: this.app.data.fairies
                    });

                } else {
                    this.app.broadcast( "fairies", {
                        fairies: this.app.data.fairies
                    });
                }

            } else {
                this.app.broadcast( "fairies", {
                    fairies: this.app.data.fairies
                });
            }
        });
    },
    tick () {
        if ( this.timeout ) {
            clearTimeout( this.timeout );
        }

        if ( this.interval ) {
            clearTimeout( this.interval );
        }

        const timeRun = Math.floor( Math.random() * (this.maxTime - this.minTime + 1) ) + this.minTime;
        const timeHit = Date.now();

        this.interval = setInterval(() => {
            const timeNow = Date.now();

            this.app.broadcast( "fairyCounter", {
                time: timeRun - (timeNow - timeHit),
                message: (this.fairies ? "Left to catch fairies&hellip;" : "Until fairies&hellip;")
            });

        }, this.pubTime );

        this.timeout = setTimeout(() => {
            this.fairies = !this.fairies;
            this.tick();

        }, timeRun );
    }
};
