// Load system
const path = require( "path" );
const http = require( "http" );

// Load registry
const lager = require( "properjs-lager" );
const request = require( "request-promise" );
const express = require( "express" );
const WebSocketServer = require( "websocket" ).server;
const WebSocketClient = require( "websocket" ).client;
const crypto = require( "crypto" );

// Load lib
const files = require( "../../files" );
const config = require( "../../config" );
const prompt = require( "./prompt" );
const alerts = require( "./alerts" );
const twitch = require( "./twitch/index" );
const oauthFile = path.join( __dirname, "json/oauth.json" );
const statsFile = path.join( __dirname, "json/stats.json" );

// This {app}
const app = {};



// {app} Config
app.data = require( "./data" );
app.dev = (process.argv.pop() === "dev" ? true : false);
app.commands = require( "./commands/index" );
app.twitch = twitch;
app.prompt = prompt;
app.alerts = alerts;
app.lager = lager;
app.config = config;
app.connections = [];
app.stats = files.read( statsFile, true );
app.gameon = false;
app.init = () => {
    // Initialize commands
    app.commands.forEach(( command ) => {
        command.init( app );
    });

    // Initialize prompt
    prompt.init( app );
    alerts.init( app );

    // Initialize server
    app.server.listen( config.hud.port );
};
app.leaders = () => {
    const fairyFinder = app.getHighStat( "fairies" );
    const heartThief = app.getHighStat( "hearts" );
    const fairyBottle = app.getHighStat( "bottles" );
    const mazeRunner = app.getHighStat( "mazes" );
    const leaderBoard = [];

    if ( fairyFinder ) {
        leaderBoard.push({
            username: fairyFinder.username,
            value: fairyFinder.fairies,
            color: "pink"
        });
    }

    if ( heartThief ) {
        leaderBoard.push({
            username: heartThief.username,
            value: heartThief.hearts,
            color: "red"
        });
    }

    if ( fairyBottle ) {
        leaderBoard.push({
            username: fairyBottle.username,
            value: fairyBottle.bottles,
            color: "blue"
        });
    }

    if ( mazeRunner ) {
        leaderBoard.push({
            username: mazeRunner.username,
            value: mazeRunner.mazes,
            color: "teal"
        });
    }

    app.broadcast( "leaders", leaderBoard );
};
app.startGame = () => {
    app.gameon = true;
    app.getCommand( "heartThief" ).tick();
    app.getCommand( "fairyFinder" ).tick();
};
app.stopGame = () => {
    app.gameon = false;
    app.getCommand( "heartThief" ).stop();
    app.getCommand( "fairyFinder" ).stop();
};
app.statGame = () => {
    const fairyFinderHtml = alerts.fairyFinderLeader( app.getHighStat( "fairies" ) );
    const heartThiefHtml = alerts.heartThiefLeader( app.getHighStat( "hearts" ) );
    const fairyBottleHtml = alerts.fairyBottleLeader( app.getHighStat( "bottles" ) );
    const mazeRunnerHtml = alerts.mazeRunnerLeader( app.getHighStat( "mazes" ) );

    app.broadcast( "leaderboards", {
        audioHit: "greatFairyFountain",
        fairyFinderHtml,
        heartThiefHtml,
        fairyBottleHtml,
        mazeRunnerHtml
    });
};
app.resetGame = () => {
    app.stats.forEach(( statUser ) => {
        statUser.fairies = 0;
        statUser.hearts = 0;
        statUser.bottles = 0;
        statUser.mazes = 0;
    });
    app.saveStats();
};
app.getHighStat = ( key ) => {
    let test = {
        fairies: 0,
        hearts: 0,
        bottles: 0,
        mazes: 0
    };

    app.stats.forEach(( stat ) => {
        // Exclude THIS channel and channel BOT
        if ( stat[ key ] > test[ key ] && stat.username !== config.all.userName && stat.username !== config.all.botName ) {
            test = stat;
        }
    });

    return test.username ? test : null;
};
app.getStats = ( name ) => {
    return app.stats.find(( stat ) => {
        return (stat.username === name);
    });
};
app.hasStats = ( name ) => {
    return app.getStats( name ) ? true : false;
};
app.setStatUser = ( name, prop ) => {
    const statUser = {
        username: name,
        fairies: 0,
        hearts: 0,
        bottles: 0,
        mazes: 0
    };

    statUser[ prop ] = 1;

    app.stats.push( statUser );
};
app.hitStatUser = ( name, prop ) => {
    const statUser = app.getStats( name );
    statUser[ prop ]++;
    app.saveStats();
};
app.saveStats = () => {
    files.write( statsFile, app.stats );
};
app.getCommand = ( comm ) => {
    return app.commands.find(( command ) => {
        return (command.name === comm);
    });
};
app.runCommand = ( comm, message ) => {
    return new Promise(( resolve, reject ) => {
        app.commands.forEach(( command ) => {
            const match = message.match( command.regex );

            if ( /*app.gameon &&*/ match && command.name === comm ) {
                resolve({
                    match
                });
            }
        });
    });
};
app.broadcast = ( event, data ) => {
    if ( app.connections.length ) {
        app.connections.forEach(( connection ) => {
            connection.send(JSON.stringify({
                event,
                data
            }));
        });
    }
};
app.refresh = () => {
    return new Promise(( resolve, reject ) => {
        request({
            url: config.all.tokenUrl,
            json: true,
            method: "POST",
            form: {
                client_id: config.all.clientId,
                client_secret: config.all.clientSecret,
                grant_type: "refresh_token",
                refresh_token: twitch.memo.oauth.refresh_token
            }

        }).then(( json ) => {
            twitch.memo.oauth = json;

            files.write( oauthFile, json, true );

            resolve();
        });
    });
};
app.oauth = ( req, res, next ) => {
    // Try local oauth
    const oauthJson = files.read( oauthFile, true );

    // 0.0 Authorized
    if ( oauthJson.access_token ) {
        twitch.memo.oauth = oauthJson;

        next();

    // 0.1 Authorization
    } else if ( !req.query.code ) {
        // https://dev.twitch.tv/docs/v5/guides/authentication/#oauth-authorization-code-flow-user-access-tokens
        res.redirect( `${config.all.oauthUrl}?client_id=${config.all.clientId}&redirect_uri=${config.hud.url}&response_type=code&scope=${config.all.scope}` );

    // 0.2 Token Request
    } else if ( req.query.code ) {
        request({
            url: config.all.tokenUrl,
            json: true,
            method: "POST",
            form: {
                client_id: config.all.clientId,
                client_secret: config.all.clientSecret,
                code: req.query.code,
                grant_type: "authorization_code",
                redirect_uri: config.hud.url
            }

        }).then(( json ) => {
            twitch.memo.oauth = json;

            files.write( oauthFile, json, true );

            res.redirect( "/" );
        });
    }
};



// {app} Express app
app.express = express();
app.express.set( "views", path.join( __dirname, "../views" ) );
app.express.set( "view engine", "ejs" );
app.express.use( express.static( path.join( __dirname, "../public" ) ) );



// {app} Express routes
app.express.get( "/", app.oauth, ( req, res ) => {
    const data = {
        dev: app.dev || req.query.dev
    };

    res.render( "index", data );
});



// {app} HTTP server
app.server = http.Server( app.express );



// {app} WebSocketServer
app.websocketserver = new WebSocketServer({
    httpServer: app.server,
    autoAcceptConnections: false
});
app.websocketserver.on( "request", ( request ) => {
    lager.cache( `[socketserver] requested ${request.origin}` );

    if ( request.origin === config.hud.url ) {
        request.accept( "echo-protocol", request.origin );

        twitch.tmi.init( app );
        twitch.helix.init( app );
        app.leaders();
    }
});
app.websocketserver.on( "connect", ( connection ) => {
    lager.cache( `[socketserver] connected` );

    app.connections.push( connection );

    app.broadcast( "hearts", {
        hearts: app.data.hearts
    });
    app.broadcast( "fairies", {
        fairies: app.data.fairies
    });

    connection.on( "message", ( message ) => {
        // { event, data }
        const utf8Data = JSON.parse( message.utf8Data );

        if ( utf8Data.event === "mazerunner" ) {
            app.getCommand( "mazeRunner" ).update( utf8Data.data );
        }
    });
});
app.websocketserver.on( "close", ( connection ) => {
    lager.cache( `[socketserver] closed` );

    app.connections.splice( app.connections.indexOf( connection ), 1 );

    lager.info( `app.connections.length: ${app.connections.length}` );
});



// {app} WebSocketClient
app.websocketclient = new WebSocketClient();
app.websocketclient.on( "connectFailed", ( error ) => {
    lager.error( `[socket] ${error}` );
});
app.websocketclient.on( "connect", ( connection ) => {
    lager.cache( `[socketclient] connected` );

    connection.on( "message", ( message ) => {
        const utf8Data = JSON.parse( message.utf8Data );

        if ( utf8Data.event === "shub" ) {
            twitch.helix.subFollow( utf8Data.data );
        }
    });
});
app.websocketclient.connect(
    config.hud.hubWSUrl,
    "echo-protocol",
    config.hud.url,
    {
        "X-Hud-Signature": `sha256=${crypto
                            .createHmac( "sha256", config.hud.secret )
                            .update( config.hud.url )
                            .digest( "hex" )}`
    }
);



// {app} Export
module.exports = app;
