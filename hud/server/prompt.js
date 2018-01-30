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

                // GAME: Fairy Finder
                } else if ( chunk === "!gameff"  ) {
                    this.app.getCommand( "fairyFinder" ).award();

                // GAME: Heart Thief
                } else if ( chunk === "!gameht"  ) {
                    this.app.getCommand( "heartThief" ).award();

                // GAME: Fairy Bottle
                } else if ( chunk === "!gamefb"  ) {
                    this.app.getCommand( "fairyBottle" ).award();

                // TEST: Host
                } else if ( chunk === "!testhost"  ) {
                    this.app.twitch.tmi.alertHost( "gerudoslut", 420 );

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
                    this.app.twitch.tmi.topCheer( { bits: 666, username: "dengarsDumpTruck" } );

                // TEST: Follow
                } else if ( chunk === "!testfollow"  ) {
                    this.app.twitch.helix.alertFollow( "dinsfire09" );

                // TEST: Background Music
                } else if ( chunk === "!testbgm"  ) {
                    this.app.broadcast( "audiobgm", {} );

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
