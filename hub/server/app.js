// Load system
const path = require( "path" );
const http = require( "http" );

// Load registry
const express = require( "express" );
const WebSocketServer = require( "websocket" ).server;
const bodyParser = require( "body-parser" );
const request = require( "request-promise" );
const lager = require( "properjs-lager" );
const slacker = require( "properjs-slacker" );

// Load lib
const files = require( "../../files" );
const config = require( "../../config" );

// This {app}
const app = {};



// {app} Config
app.ids = files.read( path.join( __dirname, "data", "ids.json" ), true );
app.dev = (process.argv.pop() === "dev" ? true : false);
app.subs = {};
app.init = () => {
    // Initialize server
    app.server.listen( config.hub.port );

    // Subscribe to users/follows event
    app.pubsub( "users/follows", "subscribe", {
        to_id: config.all.userId
    });

    // Slack notification that server is up
    slacker(
        config.hub.slackToken,
        config.hub.slackWebhook,
        config.hub.slackChannel,
        config.hub.slackContext,
        ["HUB server up..."]
    );
};
app.slackit = ( message ) => {
    slacker(
        config.hub.slackToken,
        config.hub.slackWebhook,
        config.hub.slackChannel,
        config.hub.slackContext,
        message
    );
};
app.broadcast = ( event, data ) => {
    if ( app.connection ) {
        app.connection.send(JSON.stringify({
            event,
            data
        }));

        const message = [];

        for ( const id in data ) {
            message.push( `${id}: ${data[ id ]}` );
        }

        app.slackit( message );

    } else {
        lager.data({
            event,
            data
        });
    }
};
app.unsub = () => {
    for ( const topic in app.subs ) {
        app.pubsub( app.subs[ topic ].topic, "unsubscribe", app.subs[ topic ].params );
    }
};
app.pubsub = ( topic, mode, params ) => {
    const query = [];

    for ( const param in params ) {
        query.push( `${param}=${params[ param ]}` );
    }

    if ( !app.subs[ topic ] && mode === "subscribe" ) {
        app.subs[ topic ] = { topic, mode, params };
    }

    request({
        url: "https://api.twitch.tv/helix/webhooks/hub",
        method: "POST",
        json: true,
        body: {
            "hub.callback": `${config.hub.url}/shub`,
            "hub.mode": mode,
            "hub.topic": `https://api.twitch.tv/helix/${topic}?${query.join( "&" )}`,
            "hub.secret": config.hub.secret,
            "hub.lease_seconds": config.hub.lease
        },
        headers: {
            "Client-ID": config.all.clientId,
        }

    }).then(( response ) => {
        lager.info( "TWITCH HUB RESPONSE" );
        console.log( response );
    });
}



// {app} Express app
app.express = express();
app.express.use( bodyParser.json({
    limit: "100mb"
}));
app.express.use( bodyParser.urlencoded({
    limit: "100mb",
    extended: true
}));


// {app} Express routes
app.express.get( "/", ( req, res ) => {
    res.send( "fuk you" );
});
app.express.get( "/shub", ( req, res ) => {
    lager.server( "GET SHUB" );

    const message = ["HUB /shub GET"];

    for ( const id in req.body.data ) {
        message.push( `${id}: ${req.body.data[ id ]}` );
    }

    app.slackit( message );

    res.status( 200 ).send( req.query[ "hub.challenge" ] );
});
app.express.post( "/shub", ( req, res ) => {
    if ( app.ids.indexOf( req.body.id ) === -1 ) {
        app.ids.push( req.body.id );

        app.broadcast( "shub", req.body.data );

        lager.server( "POST SHUB" );

        const message = ["HUB /shub POST", `Topic: ${req.body.topic}`];

        for ( const id in req.body.data ) {
            message.push( `${id}: ${req.body.data[ id ]}` );
        }

        app.slackit( message );

    } else {
        lager.server( "POST SHUB SKIPPED" );
    }

    res.status( 200 ).send( req.query[ "hub.challenge" ] );
});



// {app} HTTP server
app.server = http.Server( app.express );



// {app} WebSocketServer client
app.websocketserver = new WebSocketServer({
    httpServer: app.server,
    autoAcceptConnections: false
});
app.websocketserver.on( "request", ( request ) => {
    lager.cache( `[socketserver] requested ${request.origin}` );

    // console.log( request.httpRequest.headers );

    if ( request.httpRequest.headers["client-id"] === config.all.clientId ) {
        request.accept( "echo-protocol", request.origin );

        app.slackit( ["HUB socketserver requested by client..."] );
    }
});
app.websocketserver.on( "connect", ( connection ) => {
    lager.cache( `[socketserver] connected` );

    app.connection = connection;

    app.slackit( ["HUB socketserver connected to client..."] );
});
app.websocketserver.on( "close", () => {
    lager.cache( `[socketserver] closed` );

    app.slackit( ["HUB socketserver disconnected from client..."] );
});



// {app} going down...
process.on( "SIGINT", () => {
    // Unsubscribe from all subscriptions
    app.unsub();

    // Save the IDs from Twitch, cause idk yet...
    files.write( path.join( __dirname, "data", "ids.json" ), app.ids, true );

    console.log( "SIGINT process going down" );

    process.exit( 0 );
});



// {app} Export
module.exports = app;
