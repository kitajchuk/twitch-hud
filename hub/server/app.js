// Load system
const path = require( "path" );
const http = require( "http" );

// Load registry
const express = require( "express" );
const WebSocketServer = require( "websocket" ).server;
const bodyParser = require( "body-parser" );
const request = require( "request-promise" );
const crypto = require( "crypto" );
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
    // app.slackit( ["HUB server up..."] );
};
app.slackit = ( message ) => {
    if ( !app.dev ) {
        slacker(
            config.hub.slackToken,
            config.hub.slackWebhook,
            config.hub.slackChannel,
            config.hub.slackContext,
            message
        );
    }
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
    for ( const topicUrl in app.subs ) {
        app.pubsub( app.subs[ topicUrl ].topic, "unsubscribe", app.subs[ topicUrl ].params );
    }
};
app.pubsub = ( topic, mode, params ) => {
    const query = [];

    for ( const param in params ) {
        query.push( `${param}=${params[ param ]}` );
    }

    // Unique secret generated for each topic subscription
    const topicUrl = `https://api.twitch.tv/helix/${topic}?${query.join( "&" )}`;
    const secret = crypto
                    .createHmac( "sha256", config.hub.secret )
                    .update( topicUrl )
                    .digest( "hex" );

    // Only push unique subscriptions
    // Using the hub.topic we can look this up later on POSTs from Twitch
    if ( !app.subs[ topicUrl ] && mode === "subscribe" ) {
        app.subs[ topicUrl ] = {
            topic,
            mode,
            params,
            secret
        };
    }

    request({
        url: "https://api.twitch.tv/helix/webhooks/hub",
        method: "POST",
        json: true,
        body: {
            "hub.callback": `${config.hub.url}/shub`,
            "hub.mode": mode,
            "hub.topic": topicUrl,
            "hub.secret": secret,
            "hub.lease_seconds": config.hub.lease
        },
        headers: {
            "Client-ID": config.all.clientId,
        }
    });
};
app.rawbody = ( req, res, buf, encoding ) => {
    if ( buf && buf.length ) {
        req.rawBody = buf.toString( encoding || "utf8" );
        req.rawBuf = buf;
    }
};



// {app} Express app
app.express = express();
app.express.use( bodyParser.json({
    verify: app.rawbody
}));
app.express.use( bodyParser.urlencoded({
    verify: app.rawbody,
    extended: true
}));
app.express.use( bodyParser.raw({
    verify: app.rawbody,
    type: function () {
        return true;
    }
}));


// {app} Express routes
app.express.get( "/", ( req, res ) => {
    res.send( "fuk you" );
});
app.express.get( "/shub", ( req, res ) => {
    const message = ["HUB /shub GET"];

    for ( const id in req.body.data ) {
        message.push( `${id}: ${req.body.data[ id ]}` );
    }

    lager.server( "GET SHUB" );
    app.slackit( message );

    res.status( 200 ).send( req.query[ "hub.challenge" ] );
});
app.express.post( "/shub", ( req, res ) => {
    // Verify the request using the secret we sent upon subscription
    const signature = req.headers[ "x-hub-signature" ].split( "=" )[ 1 ];
    const storedSign = crypto
                        .createHmac( "sha256", app.subs[ req.body.topic ].secret )
                        .update( JSON.stringify( req.body ) )
                        .digest( "hex" );

    // This is an invalid POST so handle that...
    if ( signature !== storedSign ) {
        lager.server( "POST SHUB INVALID SIGNATURE" );
        app.slackit([
            "HUB /shub POST Invalid X-Hub-Signature",
            `Received: ${signature}`,
            `Stored: ${storedSign}`
        ]);

    // This is a valid POST but ignore same ID notifications
    } else if ( app.ids.indexOf( req.body.id ) === -1 ) {
        app.ids.push( req.body.id );

        const message = ["HUB /shub POST", `Topic: ${req.body.topic}`];

        for ( const id in req.body.data ) {
            message.push( `${id}: ${req.body.data[ id ]}` );
        }

        lager.server( "POST SHUB" );
        app.slackit( message );
        app.broadcast( "shub", req.body.data );

    } else {
        lager.server( "POST SHUB SKIPPED ON ID" );
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

        // app.slackit( ["HUB socketserver requested by client..."] );
    }
});
app.websocketserver.on( "connect", ( connection ) => {
    lager.cache( `[socketserver] connected` );

    app.connection = connection;

    // app.slackit( ["HUB socketserver connected to client..."] );
});
app.websocketserver.on( "close", () => {
    lager.cache( `[socketserver] closed` );

    // app.slackit( ["HUB socketserver disconnected from client..."] );
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
