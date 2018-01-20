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

                } else if ( chunk === "!testfollow"  ) {
                    app.twitch.helix.alertFollow( "dinsfire09" );

                } else {
                    app.twitch.tmi.emit( chunk );
                }
            }
        });
        process.stdin.on( "end", () => {
            process.stdout.write( "end" );
        });
    }
};
