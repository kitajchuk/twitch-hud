"use strict";



/**
 *
 *
 * Proxy chat to web UI
 * Also receives MY input from command-line prompt
 *
 *
 */
module.exports = {
    name: "chat",
    memo: {},
    init ( app ) {
        this.app = app;

        this.app.lager.template( `[${this.name}] command initialized` );
    },
    exec ( client, bot, channel, userstate, message, self, tmi ) {
        this.app.lager.info( "<<< chat userstate object" );
            this.app.lager.data( userstate );
        this.app.lager.info( "chat userstate object >>>" );

        if ( /^\!/.test( message ) ) {
            this.app.lager.template( `[${this.name}] skip on !command` );

        } else {
            this.app.broadcast( this.name, {
                message: message,
                user: userstate
            });
        }
    }
};
