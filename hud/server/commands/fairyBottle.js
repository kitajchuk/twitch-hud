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
            const num = 1;

            if ( this.app.data.fairies.value === 0 ) {
                this.app.twitch.tmi.emitBot( `@${userstate.username} The channel needs to catch fairies before they can spend them...` );

            } else {
                this.app.data.hearts.value += num;
                this.app.data.hearts.value = this.app.data.hearts.value > this.app.data.hearts.max ? this.app.data.hearts.max : this.app.data.hearts.value;

                this.app.data.fairies.value -= num;
                this.app.data.fairies.value = this.app.data.fairies.value < 0 ? 0 : this.app.data.fairies.value;

                if ( !this.app.hasStats( userstate.username ) ) {
                    this.app.setStatUser( userstate.username, "bottles" );

                } else {
                    this.app.hitStatUser( userstate.username, "bottles" );
                }

                this.app.broadcast( "alert", {
                    audioHit: "fairy",
                    alertHtml: this.app.alerts.fairyBottle( userstate )
                });

                this.app.broadcast( "hearts", {
                    hearts: this.app.data.hearts
                });

                this.app.broadcast( "fairies", {
                    fairies: this.app.data.fairies
                });

                this.app.leaders();
            }
        });
    }
};
