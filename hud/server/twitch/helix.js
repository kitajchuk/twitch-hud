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
    alertFollows ( data ) {
        // request({
        //     url: `https://api.twitch.tv/helix/users?id=${data.from_id}`,
        //     json: true,
        //     method: "GET",
        //     headers: {
        //         "Authorization": `Bearer ${this.app.twitch.memo.oauth.access_token}`,
        //         "Client-ID": this.app.config.all.clientId
        //     }
        //
        // }).then(( response ) => {
        //
        // });
        this.api.getTwitchUserById( data.from_id ).then(( twitchUser ) => {
            const alertHtml = `
                <h1 class="bk">Hyrule Heroes</h1>
                <p><span class="bk">${twitchUser.display_name}</span> has joined the ranks of the finest Hylians around!</p>
            `;

            this.app.broadcast( "alert", {
                alertHtml: alertHtml
            });
        });
    }
};
