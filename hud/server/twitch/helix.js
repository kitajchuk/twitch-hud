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
        this.api.getTwitchUserById( data.from_id ).then(( twitchUser ) => {
            this.alertFollow( twitchUser.display_name );
        });
    },
    alertFollow ( username ) {
        const alertHtml = `
            <h1 class="yellow">Is that&hellip; a skull kid&hellip;</h1>
            <p><span class="blue">${username}</span> found their way through the <span class="blue">Lost Woods</span> and stumbled upon our channel. Welcome to the lost kids <span class="blue">${username}</span>&hellip;</p>
        `;

        this.app.broadcast( "alert", {
            alertHtml: alertHtml
        });
    }
};
