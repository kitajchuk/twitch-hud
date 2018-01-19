// Load system
const path = require( "path" );
const http = require( "http" );

// Load registry
const lager = require( "properjs-lager" );
const request = require( "request-promise" );
const express = require( "express" );
const WebSocketServer = require( "websocket" ).server;
const WebSocketClient = require( "websocket" ).client;

// Load lib
const files = require( "../../files" );
const config = require( "../../config" );
const prompt = require( "./prompt" );
const twitch = require( "./twitch/index" );

// This {app}
const app = {};



// {app} Config
app.data = files.read( path.join( __dirname, "data", "data.json" ), true );
app.dev = (process.argv.pop() === "dev" ? true : false);
app.commands = require( "./commands/index" );
app.twitch = twitch;
app.prompt = prompt;
app.lager = lager;
app.config = config;
app.port = 5050; // Skate or Die!
app.url = `http://localhost:${app.port}`;
app.hub = "ws://twitchhub.kitajchuk.com";
app.init = () => {
    // Initialize commands
    app.commands.forEach(( command ) => {
        command.init( app );
    });

    // Initialize prompt
    prompt.init( app );

    // Initialize server
    app.server.listen( app.port );
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
    app.connection.send(JSON.stringify({
        event,
        data
    }));
};
app.oauth = ( req, res, next ) => {
    // 0.1 Authorization
    if ( !req.query.code && !twitch.memo.oauth ) {
        // https://dev.twitch.tv/docs/v5/guides/authentication/#oauth-authorization-code-flow-user-access-tokens
        res.redirect( `${config.twitch.oauthUrl}?client_id=${config.twitch.clientId}&redirect_uri=${app.url}&response_type=code&scope=${config.twitch.scope}` );

    // 0.2 Token Request
    } else if ( req.query.code && !twitch.memo.oauth ) {
        request({
            url: config.twitch.tokenUrl,
            json: true,
            method: "POST",
            form: {
                client_id: config.twitch.clientId,
                client_secret: config.twitch.clientSecret,
                code: req.query.code,
                grant_type: "authorization_code",
                redirect_uri: app.url
            }

        }, ( error, response, oauthJson ) => {
            twitch.memo.oauth = oauthJson;

            res.redirect( "/" );
        });

    // 0.4 Authorized
    } else {
        twitch.tmi.init( app );
        twitch.helix.init( app );
        twitch.kraken.init( app );

        next();
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
        dev: app.dev
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

    request.accept( "echo-protocol", request.origin );
});
app.websocketserver.on( "connect", ( connection ) => {
    lager.cache( `[socketserver] connected` );

    app.connection = connection;

    connection.on( "message", ( message ) => {
        // { event, data }
        const utf8Data = JSON.parse( message.utf8Data );

        if ( utf8Data.event === "chat" ) {
            app.twitch.tmi.emit( utf8Data.data.message );

        } else if ( utf8Data.event === "hearts" ) {
            app.broadcast( "hearts", {
                hearts: app.data.hearts
            });

        } else if ( utf8Data.event === "rupees" ) {
            app.broadcast( "rupees", {
                rupees: app.data.rupees
            });
        }
    });
});
app.websocketserver.on( "close", () => {
    lager.cache( `[socketserver] closed` );
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
            twitch.helix.alertFollows( utf8Data.data );
        }
    });
});
app.websocketclient.connect(
    app.hub,
    "echo-protocol",
    app.url,
    {
        "Client-ID": config.twitch.clientId
    }
);



// {app} Export
module.exports = app;
