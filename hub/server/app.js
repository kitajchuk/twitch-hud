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
    const message = ["Log: Twitch :GET /shub"];

    for ( const id in req.body.data ) {
        message.push( `${id}: ${req.body.data[ id ]}` );
    }

    lager.server( "Log: Twitch :GET /shub" );
        app.slackit( message );

    res.status( 200 ).send( req.query[ "hub.challenge" ] );
});
app.express.post( "/shub", ( req, res ) => {
    // Verify the request using the secret we sent upon subscription
    const signature = req.headers[ "x-hub-signature" ].split( "=" )[ 1 ];
    const storedSign = crypto
                        .createHmac( "sha256", app.subs[ req.body.topic ].secret )
                        .update( req.rawBody )
                        .digest( "hex" );

    // This is an invalid POST so handle that...
    if ( signature !== storedSign ) {
        lager.error( "Error: Twitch :POST /shub has invalid X-Hub-Signature" );
            app.slackit([
                "Error: Twitch :POST /shub has invalid X-Hub-Signature",
                `Received: ${signature}`,
                `Stored: ${storedSign}`
            ]);

    // This is a valid POST but ignore repeat ID notifications
    } else if ( app.ids.indexOf( req.body.id ) === -1 ) {
        app.ids.push( req.body.id );

        const message = [`Log: Twitch :POST /shub topic ${req.body.topic}`];

        for ( const id in req.body.data ) {
            message.push( `${id}: ${req.body.data[ id ]}` );
        }

        lager.server( `Log: Twitch :POST /shub topic ${req.body.topic}` );
            app.slackit( message );
            app.broadcast( "shub", req.body.data );

    } else {
        lager.server( `Log: Twitch :POST /shub skipped id ${req.body.id}` );
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

    // Verify the request using the secret that should have been sent
    const signature = request.httpRequest.headers["x-hud-signature"].split( "=" )[ 1 ];
    const storedSign = crypto
                        .createHmac( "sha256", config.hud.secret )
                        .update( request.origin )
                        .digest( "hex" )

    // This is an invalid request to connect so handle that...
    if ( signature !== storedSign ) {
        lager.error( "Error: Socket request has invalid X-Hud-Signature" );
            app.slackit([
                "Error: Socket request has invalid X-Hud-Signature",
                `Received: ${signature}`,
                `Stored: ${storedSign}`
            ]);
            request.reject();

    } else {
        lager.server( "Log: Socket connected with valid X-Hud-Signature" );
            request.accept( "echo-protocol", request.origin );
    }
});
app.websocketserver.on( "connect", ( connection ) => {
    lager.cache( `[socketserver] connected` );

    app.connection = connection;
});
app.websocketserver.on( "close", () => {
    lager.cache( `[socketserver] closed` );
});



// {app} going down...
process.on( "SIGINT", () => {
    // Unsubscribe from all subscriptions
    app.unsub();

    // Save the IDs from Twitch, cause idk yet...
    files.write( path.join( __dirname, "data", "ids.json" ), app.ids, true );

    lager.error( "SIGINT process terminated" );

    process.exit( 0 );
});



// {app} Export
module.exports = app;
