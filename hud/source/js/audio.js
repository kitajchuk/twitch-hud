import $ from "properjs-hobo";
// import socket from "./socket";



const audio = {
    init () {
        this.node = $( ".js-hud-audio" );
        this.media = {
            item: "/media/OOT_Fanfare_SmallItem.wav",
            heart: "/media/OOT_Fanfare_HeartContainer.wav",
            scream: "/media/OOT_YoungLink_Scream1.wav"
        };

        return this;
    },

    play ( sound ) {
        this.node[ 0 ].src = this.media[ sound ];
        this.node[ 0 ].play();
    }
};



export default audio;
