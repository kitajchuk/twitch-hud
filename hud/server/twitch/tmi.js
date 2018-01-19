"use strict";



/**
 *
 *
 * tmi.js
 * https://docs.tmijs.org
 *
 *
 */

// Load registry
const tmi = require( "tmi.js" );
const request = require( "request-promise" );



// This module
module.exports = {
    name: "twitch tmi",
    memo: {},
    init ( app ) {
        if ( !this.memo.client && !this.memo.bot ) {
            this.app = app;
            this.initMe();
            this.initBot();

            this.app.lager.server( `[${this.name}] utility initialized` );
        }
    },
    emit ( message ) {
        this.memo.client.say( `#${this.app.config.all.userName}`, message );
    },
    initMe () {
        this.memo.client = new tmi.client({
            options: {
                clientId: this.app.config.all.clientId
            },
            connection: {
                reconnect: true
            },
            identity: {
                username: this.app.config.all.userName,
                password: this.app.twitch.memo.oauth.access_token
            },
            channels: [this.app.config.all.userChannel]
        });

        this.memo.client.connect().then(( foo ) => {
            this.app.lager.server( `[twitch] ${this.memo.client.getUsername()} connected` );

            // Chat
            this.memo.client.on( "chat", ( channel, userstate, message, self ) => {
                this.app.commands.forEach(( command ) => {
                    command.exec(
                        this.memo.client,
                        this.memo.bot,
                        channel,
                        userstate,
                        message,
                        self,
                        tmi
                    );
                });
            });

            // Hosts
            this.subHosts();

            // Subs ( alert )
            // Cheer/Bits ( alert ) {userstate.bits}
            // Follows ( alert )
            // Raids ( alert )

        }).catch(( error ) => {
            this.app.lager.error( `[${this.name}] ${error}` );
        });
    },
    initBot () {
        this.memo.bot = new tmi.client({
            options: {
                clientId: this.app.config.all.clientId
            },
            connection: {
                reconnect: true
            },
            identity: {
                username: this.app.config.all.botName,
                password: this.app.config.all.botToken
            },
            channels: [this.app.config.all.userChannel, this.app.config.all.botChannel]
        });

        this.memo.bot.connect().then(() => {
            this.app.lager.server( `[${this.name}] ${this.memo.bot.getUsername()} connected` );

        }).catch(( error ) => {
            this.app.lager.error( `[${this.name}] ${error}` );
        });
    },
    subHosts ( app ) {
        this.memo.client.on( "hosted", ( channel, username, viewers, autohost ) => {
            const alertHtml = `
                <h1 class="bk">Honorable Host</h1>
                <p><span class="bk">${username}</span> is hosting you with ${viewers} ${viewers === 1 ? "viewer" : "viewers"}!</p>
            `;

            this.app.broadcast( "alert", {
                alertHtml: alertHtml
            });
        });
    }
};
