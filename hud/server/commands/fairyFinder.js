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
        this.throttle = 10000; // 10 seconds in milliseconds
        this.users = {};

        this.app.lager.template( `[${this.name}] command initialized` );
    },
    exec ( client, bot, channel, userstate, message, self, tmi ) {
        this.app.runCommand( this.name, message ).then(( response ) => {
            if ( this.fairies ) {
                // User is throttled
                if ( this.users[ userstate.username ] ) {
                    this.app.twitch.tmi.emitBot( `@${userstate.username} You can only try to catch a fairy every 10 seconds.` );

                // User is in the clear
                } else {
                    const hit = Math.floor( Math.random() * (this.maxHit - this.minHit + 1) ) + this.minHit;
                    const num = 1;

                    if ( !this.app.dev ) {
                        this.users[ userstate.username ] = true;

                        setTimeout(() => {
                            delete this.users[ userstate.username ];

                        }, this.throttle );
                    }

                    if ( hit > this.hitPercent ) {
                        this.app.data.fairies.value += num;
                        this.app.data.fairies.value = this.app.data.fairies.value > this.app.data.fairies.max ? this.app.data.fairies.max : this.app.data.fairies.value;

                        const alertHtml = `
                            <h1 class="yellow">Fairy Finder</h1>
                            <p><span class="blue">${userstate.username}</span> caught a fairy with a hit percent of <span class="blue">${hit}</span>! We now have <span class="blue">${this.app.data.fairies.value}</span> out of <span class="blue">${this.app.data.fairies.max}</span> fairies!</p>
                        `;
                        const statUser = this.app.getStats( userstate.username );

                        if ( !statUser ) {
                            this.app.stats.push({
                                username: userstate.username,
                                fairies: 1,
                                hearts: 0,
                                bottles: 0
                            });

                        } else {
                            statUser.fairies++;
                            this.app.saveStats( userstate.username );
                        }

                        this.app.broadcast( "alert", {
                            audioHit: "greatFairyLaugh1",
                            alertHtml
                        });

                        this.app.broadcast( "fairies", {
                            fairies: this.app.data.fairies
                        });

                        this.app.twitch.tmi.emitBot( `@${userstate.username} You caught a fairy with a hit percent of ${hit}!` );

                    } else {
                        this.app.twitch.tmi.emitBot( `@${userstate.username} You tried to catch a fairy but you missed with a hit percent of ${hit}...` );
                    }
                }

            } else {
                this.app.twitch.tmi.emitBot( `@${userstate.username} You can't catch a fairy right now, keep an eye on the timer :)` );
            }
        });
    },
    stop () {
        if ( this.timeout ) {
            clearTimeout( this.timeout );
        }

        if ( this.interval ) {
            clearTimeout( this.interval );
        }

        // Always reset to TRUE after stopping
        this.fairies = true;

        this.app.broadcast( "fairyCounter", {
            time: 0,
            bool: this.fairies
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
                bool: this.fairies
            });

        }, this.pubTime );

        this.timeout = setTimeout(() => {
            this.fairies = !this.fairies;
            this.tick();

        }, timeRun );
    }
};
