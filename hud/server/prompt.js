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
                // Run tests...
                if ( chunk === "!testhost"  ) {
                    this.app.twitch.tmi.alertHost( "gerudoslut", 420 );

                } else if ( chunk === "!testsub"  ) {
                    this.app.twitch.tmi.alertSub( "gamespite", "Now I get to use all the emotes..." );

                } else if ( chunk === "!testresub"  ) {
                    this.app.twitch.tmi.alertResub( "schmoopiie", "You're using my code to make this...", 7 );

                } else if ( chunk === "!testcheer"  ) {
                    this.app.twitch.tmi.alertCheer( { username: "freakyFox12", bits: 1000 }, "You can have all my bits...!" );

                } else if ( chunk === "!testtopcheer"  ) {
                    this.app.twitch.tmi.topCheer({
                        bits: 1000,
                        username: "dengarsDumpTruck"
                    });

                } else if ( chunk === "!testfollow"  ) {
                    this.app.twitch.helix.alertFollow( "dinsfire09" );

                } else if ( chunk === "!ffa"  ) {
                    this.app.getCommand( "fairyFinder" ).award();

                } else if ( chunk === "!hta"  ) {
                    this.app.getCommand( "heartThief" ).award();

                } else if ( chunk === "!fba"  ) {
                    this.app.getCommand( "fairyBottle" ).award();

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
