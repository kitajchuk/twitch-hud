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
const request = require( "request-promise" );



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
        this.getSubs();
        this.getFollows();

        this.app.lager.server( `[${this.name}] utility initialized` );
    },
    getSubs () {
        request({
            url: `https://api.twitch.tv/kraken/channels/${this.app.config.all.userId}/subscriptions`,
            json: true,
            method: "GET",
            headers: {
                "Accept": this.app.config.all.accept,
                "Authorization": `OAuth ${this.app.twitch.memo.oauth.access_token}`,
                "Client-ID": this.app.config.all.clientId
            }

        }).then(( data ) => {
            const subs = data.subscriptions.filter(( sub ) => {
                return (sub.user._id !== this.app.config.all.userId);

            }).sort(( a, b ) => {
                return (new Date( b.created_at ) - new Date( a.created_at ));

            }).slice( 0, 5 );

            this.app.broadcast(
                "subs",
                subs.map(( sub ) => {
                    return sub.user.display_name;
                })
            );
        });
    },
    getFollows () {
        this.api.sendHelixRequest( `users/follows?to_id=${this.app.config.all.userId}` )
            .then(( follows ) => {
                const recent = follows.slice( 0, 5 );
                const query = [];

                recent.forEach(( follow ) => {
                    query.push( `id=${follow.from_id}` );
                });

                this.api.sendHelixRequest( `users?${query.join( "&" )}` )
                    .then(( followers ) => {
                        this.app.broadcast(
                            "follows",
                            followers.map(( follow ) => {
                                return follow.display_name;
                            })
                        );
                    });
            });
    },
    subFollow ( data ) {
        this.api.getTwitchUserById( data.from_id ).then(( userstate ) => {
            this.app.lager.info( "<<< new user object" );
                this.app.lager.data( userstate );
            this.app.lager.info( "new user object >>>" );

            this.alertFollow( userstate.display_name );
            this.getFollows();
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
