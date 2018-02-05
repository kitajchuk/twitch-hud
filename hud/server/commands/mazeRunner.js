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
        const statUser = this.app.getStats( data.username );

        if ( !statUser ) {
            this.app.stats.push({
                username: data.username,
                fairies: 0,
                hearts: 0,
                bottles: 0,
                mazes: 1
            });

        } else {
            statUser.mazes++;
            this.app.saveStats( data.username );
        }

        this.app.leaders();
    }
};
