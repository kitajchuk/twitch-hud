import alert from "./alert";
import hearts from "./hearts";
import fairies from "./fairies";
import audio from "./audio";
import follows from "./follows";
import subs from "./subs";
import cheers from "./cheers";




const socket = {
    init () {
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
            if ( response.event === "alert" ) {
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

            } else if ( response.event === "fairyCounter" ) {
                fairies.counter( response.data );

            } else if ( response.event === "heartCounter" ) {
                hearts.counter( response.data );
            }
        };
        this.websocket.onopen = () => {
            window.app.audio = audio.init();
            window.app.alert = alert.init();
            window.app.hearts = hearts.init();
            window.app.fairies = fairies.init();
            window.app.follows = follows.init();
            window.app.subs = subs.init();
            window.app.cheers = cheers.init();
        };
        this.websocket.onclose = () => {};
    }
};



export default socket;
