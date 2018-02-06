"use strict";



/**
 *
 *
 * Proxy chat to web UI
 *
 *
 */
module.exports = {
    name: "mazeRunner",
    regex: /^\!(left|right|up|down)\s(.*?)$/,
    memo: {},
    init ( app ) {
        this.app = app;

        this.app.lager.template( `[${this.name}] command initialized` );
    },
    exec ( client, bot, channel, userstate, message, self, tmi ) {
        this.app.runCommand( this.name, message ).then(( response ) => {
            this.app.broadcast( "mazerunner", {
                username: userstate.username,
                direction: response.match[ 1 ],
                distance: parseInt( response.match[ 2 ], 10 )
            });
        });
    },
    update ( data ) {
        if ( !this.app.hasStats( data.username ) ) {
            this.app.setStatUser( data.username, "mazes" );

        } else {
            this.app.hitStatUser( data.username, "mazes" );
        }

        this.app.broadcast( "alert", {
            audioHit: "smallItem",
            alertHtml: this.app.alerts.mazeRunnerWin( data )
        });

        this.app.leaders();
    }
};
