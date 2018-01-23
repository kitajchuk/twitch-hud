"use strict";



module.exports = {
    name: "prompt",
    data: {},
    init ( app ) {
        app.lager.server( `[${this.name}] utility initialized` );

        process.stdin.setEncoding( "utf8" );
        process.stdin.on( "readable", () => {
            const chunk = process.stdin.read().replace( /^\s+|\s+$/g, "" );

            if ( chunk !== null ) {
                // Run tests...
                if ( chunk === "!testhost"  ) {
                    app.twitch.tmi.alertHost( "gerudoslut", 420 );

                } else if ( chunk === "!testsub"  ) {
                    app.twitch.tmi.alertSub( "gamespite", "Now I get to use all the emotes..." );

                } else if ( chunk === "!testresub"  ) {
                    app.twitch.tmi.alertResub( "schmoopiie", "You're using my code to make this...", 7 );

                } else if ( chunk === "!testcheer"  ) {
                    app.twitch.tmi.alertCheer( { username: "freakyFox12", bits: 1000 }, "You can have all my bits...!" );

                } else if ( chunk === "!testfollow"  ) {
                    app.twitch.helix.alertFollow( "dinsfire09" );

                } else {
                    app.twitch.tmi.emitMe( chunk );
                }
            }
        });
        process.stdin.on( "end", () => {
            process.stdout.write( "end" );
        });
    }
};
