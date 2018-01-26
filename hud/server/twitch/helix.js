"use strict";



/**
 *
 *
 *
 * Twitch Helix API
 * https://www.npmjs.com/package/twitch-helix
 *
 *
 */

// Load registry
const TwitchHelix = require( "twitch-helix" );



// This module
module.exports = {
    name: "twitch helix",
    memo: {},
    init ( app ) {
        this.app = app;
        this.api = new TwitchHelix({
            clientId: this.app.config.all.clientId,
            clientSecret: this.app.config.all.clientSecret
        });

        this.app.lager.server( `[${this.name}] utility initialized` );
    },
    subFollow ( data ) {
        this.api.getTwitchUserById( data.from_id ).then(( userstate ) => {
            this.app.lager.info( "<<< new user object" );
                this.app.lager.data( userstate );
            this.app.lager.info( "new user object >>>" );

            this.alertFollow( userstate.display_name );
        });
    },
    alertFollow ( username ) {
        const alertHtml = `
            <h1 class="yellow">Follow</h1>
            <p><span class="blue">${username}</span> is now following the channel!</p>
        `;

        this.app.broadcast( "alert", {
            audioHit: "smallItem",
            alertHtml: alertHtml
        });
    }
};
