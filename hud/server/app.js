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
const twitch = require( "./twitch/index" );
const oauthFile = path.join( __dirname, "oauth.json" );
const statsFile = path.join( __dirname, "stats.json" );

// This {app}
const app = {};



// {app} Config
app.data = require( "./data" );
app.dev = (process.argv.pop() === "dev" ? true : false);
app.commands = require( "./commands/index" );
app.twitch = twitch;
app.prompt = prompt;
app.lager = lager;
app.config = config;
app.connections = [];
app.stats = files.read( statsFile, true );
app.init = () => {
    // Initialize commands
    app.commands.forEach(( command ) => {
        command.init( app );
    });

    // Initialize prompt
    prompt.init( app );

    // Initialize server
    app.server.listen( config.hud.port );

    // app.lager.info( "<<< app data" );
    //     app.lager.data( app.data );
    // app.lager.info( "app data >>>" );
};
app.getHighStat = ( key ) => {
    let test = {
        username: config.all.botName,
        fairies: 0,
        hearts: 0,
        bottles: 0
    };

    return app.stats.forEach(( stat ) => {
        if ( stat[ key ] > test[ key ] ) {
            test = stat;
        }
    });

    return test;
};
app.getStats = ( name ) => {
    return app.stats.find(( stat ) => {
        return (stat.username === name);
    });
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

            if ( match && command.name === comm ) {
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
        twitch.tmi.init( app );
        twitch.helix.init( app );

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
        // const utf8Data = JSON.parse( message.utf8Data );
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
