import alert from "./alert";
import hearts from "./hearts";
import fairies from "./fairies";
import audio from "./audio";



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
                audio.play( response.data.alertType === "heartThief" ? "scream" : "heart" );

            } else if ( response.event === "hearts" ) {
                hearts.pipe( response.data );

            } else if ( response.event === "fairies" ) {
                fairies.pipe( response.data );

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
        };
        this.websocket.onclose = () => {};

        // window.onload = () => {};
    }
};



export default socket;
