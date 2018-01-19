import alert from "./alert";
import hearts from "./hearts";
import chat from "./chat";



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

            // Chat
            if ( response.event === "chat" ) {
                console.log( response );

            // Emotes
            } else if ( response.event === "emotes" ) {
                chat.pipe( "emotes", response.data.emotes );

            // Badges
            } else if ( response.event === "badges" ) {
                chat.pipe( "badges", response.data.badges );

            // HUD::events
            } else if ( response.event === "alert" ) {
                alert.push( response.data );

            } else if ( response.event === "hearts" ) {
                hearts.pipe( response.data );
            }
        };
        this.websocket.onopen = () => {
            window.app.chat = chat.init();
            window.app.alert = alert.init();
            window.app.hearts = hearts.init();
        };
        this.websocket.onclose = () => {};

        // window.onload = () => {};
    }
};



export default socket;
