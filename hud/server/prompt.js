"use strict";



module.exports = {
    name: "prompt",
    data: {},
    init ( app ) {
        this.app = app;

        app.lager.server( `[${this.name}] utility initialized` );

        process.stdin.setEncoding( "utf8" );
        process.stdin.on( "readable", () => {
            const chunk = process.stdin.read().replace( /^\s+|\s+$/g, "" );

            if ( chunk !== null ) {
                // GAME: Start app game
                if ( chunk === "!gamestart"  ) {
                    this.app.startGame();

                // GAME: Stop app game
                } else if ( chunk === "!gamestop"  ) {
                    this.app.stopGame();

                // GAME: Leader boards
                } else if ( chunk === "!gamestat"  ) {
                    this.app.statGame();

                // GAME: Leader boards
            } else if ( chunk === "!gamereset"  ) {
                    this.app.resetGame();

                // GAME: Maze Runner
                } else if ( chunk === "!gamemaze"  ) {
                    this.app.broadcast( "maze", {} );

                // TEST: Host
                } else if ( chunk === "!testhost"  ) {
                    this.app.twitch.tmi.alertHost( "pizzaButt", 420 );

                // TEST: Sub
                } else if ( chunk === "!testsub"  ) {
                    this.app.twitch.tmi.alertSub( "gamespite", "Now I get to use all the emotes..." );

                // TEST: Resub
                } else if ( chunk === "!testresub"  ) {
                    this.app.twitch.tmi.alertResub( "schmoopiie", "You're using my code to make this...", 7 );

                // TEST: Cheer ( Bits )
                } else if ( chunk === "!testcheer"  ) {
                    this.app.twitch.tmi.alertCheer( { bits: 420, username: "freakyFox12" }, "You can have all my bits...!" );

                // TEST: Top Cheer
                } else if ( chunk === "!testcheerswap"  ) {
                    this.app.twitch.tmi.alertCheer( { bits: 666, username: "pikaFOO" }, "" );
                    this.app.twitch.tmi.topCheer( { bits: 666, username: "pikaFOO" } );

                // TEST: Follow
                } else if ( chunk === "!testfollow"  ) {
                    this.app.twitch.helix.alertFollow( "dinsfire09" );

                // TOGGLE: Background Music
                } else if ( chunk === "!bgm"  ) {
                    this.app.broadcast( "bgm", {} );

                // CHAT
                } else {
                    this.app.twitch.tmi.emitMe( chunk );
                }
            }
        });
        process.stdin.on( "end", () => {
            process.stdout.write( "end" );
        });
    }
};
