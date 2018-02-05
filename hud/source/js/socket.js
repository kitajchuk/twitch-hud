// import $ from "properjs-hobo";
import alert from "./lib/alert";
import hearts from "./lib/hearts";
import fairies from "./lib/fairies";
import audio from "./lib/audio";
import follows from "./lib/follows";
import subs from "./lib/subs";
import cheers from "./lib/cheers";
import leaders from "./lib/leaders";
import maze from "./lib/maze";



const socket = {
    init ( app ) {
        this.app = app;
        this.websocket = new window.WebSocket( `ws://${window.location.host}`, "echo-protocol" );
        this.bind();

        return this;
    },

    emit ( event, data ) {
        this.websocket.send(JSON.stringify({
            event,
            data
        }));
    },

    bind () {
        this.websocket.onmessage = ( message ) => {
            const response = JSON.parse( message.data );

            // HUD::events
            if ( response.event === "leaderboards" ) {
                alert.push({
                    alertHtml: response.data.heartThiefHtml
                });
                alert.push({
                    alertHtml: response.data.fairyBottleHtml
                });
                audio.backgroundQuiet( true );
                audio.play( response.data.audioHit ).then(( /*audioHit*/ ) => {
                    alert.hide();
                    audio.backgroundQuiet( false );
                });
                setTimeout(() => {
                    alert.show({
                        alertHtml: response.data.fairyFinderHtml
                    });

                }, (alert.duration * 2) + 1000 );

            } else if ( response.event === "bgm" ) {
                audio.background();

            } else if ( response.event === "maze" ) {
                maze.render();

            } else if ( response.event === "mazerunner" ) {
                maze.push( response.data );

            } else if ( response.event === "alert" ) {
                alert.push( response.data );
                audio.play( response.data.audioHit );

            } else if ( response.event === "hearts" ) {
                hearts.pipe( response.data );

            } else if ( response.event === "fairies" ) {
                fairies.pipe( response.data );

            } else if ( response.event === "follows" ) {
                follows.pipe( response.data );

            } else if ( response.event === "subs" ) {
                subs.pipe( response.data );

            } else if ( response.event === "topcheer" ) {
                cheers.pipe( response.data );

            } else if ( response.event === "topcheerswap" ) {
                cheers.swap( response.data );

            } else if ( response.event === "leaders" ) {
                leaders.pipe( response.data );

            } else if ( response.event === "fairyCounter" ) {
                fairies.counter( response.data );

            } else if ( response.event === "heartCounter" ) {
                hearts.counter( response.data );
            }
        };
        this.websocket.onopen = () => {
            this.app.audio = audio.init();
            this.app.alert = alert.init();
            this.app.hearts = hearts.init();
            this.app.fairies = fairies.init();
            this.app.follows = follows.init();
            this.app.subs = subs.init();
            this.app.cheers = cheers.init();
            this.app.leaders = leaders.init();
            this.app.maze = maze.init();
        };
        this.websocket.onclose = () => {};
    }
};



export default socket;
