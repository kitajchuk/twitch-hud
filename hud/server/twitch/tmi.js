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
    emitMe ( message ) {
        this.memo.client.say( `#${this.app.config.all.userName}`, message );
    },
    emitBot ( message ) {
        this.memo.bot.say( `#${this.app.config.all.userName}`, message );
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

            // Chat::Listeners
            this.subHost();
            this.subSub();
            this.subResub();
            this.subCheer();

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
    subHost ( app ) {
        this.memo.client.on( "hosted", ( channel, username, viewers, autohost ) => {
            this.alertHost( username, viewers );
        });
    },
    alertHost ( username, viewers ) {
        const alertHtml = `
            <h1 class="yellow">Host</h1>
            <p><span class="blue">${username}</span> is now hosting you with a viewing party of <span class="blue">${viewers}</span>! Welcome to the channel!</p>
        `;

        this.app.broadcast( "alert", {
            alertHtml: alertHtml
        });
    },
    subSub ( app ) {
        this.memo.client.on( "subscription", ( channel, username, method, message, userstate ) => {
            this.app.lager.info( "<<< sub method object" );
                this.app.lager.data( method );
            this.app.lager.info( "sub method object >>>" );

            this.alertSub( username, message, method );
        });
    },
    alertSub ( username, message, method ) {
        const alertHtml = `
            <h1 class="yellow">Sub</h1>
            <p><span class="blue">${username}</span> just subscribed to the channel! They said: <span class="blue">${message ? message : "Nothing&hellip;"}</span></p>
        `;

        this.app.broadcast( "alert", {
            alertHtml: alertHtml
        });
    },
    subResub ( app ) {
        this.memo.client.on( "resub", ( channel, username, months, message, userstate, methods ) => {
            this.app.lager.info( "<<< resub methods object" );
                this.app.lager.data( methods );
            this.app.lager.info( "resub methods object >>>" );

            this.alertResub( username, message, months, methods );
        });
    },
    alertResub ( username, message, months, methods ) {
        const alertHtml = `
            <h1 class="yellow">Resub</h1>
            <p><span class="blue">${username}</span> has resubscribed to the channel for ${months} months in a row! They said: <span class="blue">${message ? message : "Nothing&hellip;"}</span></p>
        `;

        this.app.broadcast( "alert", {
            alertHtml: alertHtml
        });
    },
    subCheer ( app ) {
        this.memo.client.on( "cheer", ( channel, userstate, message ) => {
            this.app.lager.info( "<<< cheer userstate object" );
                this.app.lager.data( userstate );
            this.app.lager.info( "cheer userstate object >>>" );

            this.alertCheer( userstate, message );
        });
    },
    alertCheer ( userstate, message ) {
        const alertHtml = `
            <h1 class="yellow">Cheer</h1>
            <p><span class="blue">${userstate.username}</span> has just cheered ${userstate.bits} bits! They said: <span class="blue">${message ? message : "Nothing&hellip;"}</span></p>
        `;

        this.app.broadcast( "alert", {
            alertHtml: alertHtml
        });
    }
};
