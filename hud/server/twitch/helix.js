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
        this.getCheer();
        this.getSubs();
        this.getFollows();

        this.app.lager.server( `[${this.name}] utility initialized` );
    },
    getReq ( url, method ) {
        return new Promise(( resolve, reject ) => {
            // Use local method so we can resolve original Promise if we need to reauthenticate
            const _getReq = () => {
                request({
                    url,
                    json: true,
                    method,
                    headers: {
                        "Accept": this.app.config.all.accept,
                        "Authorization": `OAuth ${this.app.twitch.memo.oauth.access_token}`,
                        "Client-ID": this.app.config.all.clientId
                    },

                }).then(( response ) => {
                    resolve( response );

                }).catch(( response ) => {
                    // Need to handle token refreshes
                    // https://dev.twitch.tv/docs/authentication#refreshing-access-tokens
                    // Funnel through the refresh process and then redo the request and resolve
                    if ( response.response.headers["www-authenticate"] ) {
                        this.app.refresh().then(() => {
                            _getReq();
                        });
                    }
                });
            };

            _getReq();
        });
    },
    getCheer () {
        this.getReq(
            `https://api.twitch.tv/bits/channels/${this.app.config.all.userId}/events/recent`,
            "GET"

        ).then(( data ) => {
            if ( data.top.username && data.top.amount ) {
                this.app.broadcast(
                    "topcheer",
                    {
                        bits: data.top.amount,
                        color: data.top.tags.color,
                        username: data.top.username
                    }
                );
            }
        });
    },
    getSubs () {
        this.getReq(
            `https://api.twitch.tv/kraken/channels/${this.app.config.all.userId}/subscriptions`,
            "GET"

        ).then(( data ) => {
            const subs = data.subscriptions.filter(( sub ) => {
                // Filter out me, @kitajchuk
                return (sub.user._id !== this.app.config.all.userId);

            }).sort(( a, b ) => {
                return (new Date( b.created_at ) - new Date( a.created_at ));

            }).slice( 0, 3 );

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
                const recent = follows.filter(( follow ) => {
                    // Filter out my bot, @kitajchukbot
                    return (follow.from_id !== this.app.config.all.botId);

                }).slice( 0, 3 );
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
