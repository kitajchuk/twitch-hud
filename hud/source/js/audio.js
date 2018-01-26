import $ from "properjs-hobo";
// import socket from "./socket";



const audio = {
    init () {
        this.node = $( ".js-hud-audio" );
        this.media = {
            item: "/media/OOT_Fanfare_Item.wav",
            smallItem: "/media/OOT_Fanfare_SmallItem.wav",
            heartContainer: "/media/OOT_Fanfare_HeartContainer.wav",
            getHeart: "/media/OOT_Get_Heart.wav",
            scream1: "/media/OOT_YoungLink_Scream1.wav",
            scream2: "/media/OOT_YoungLink_Scream2.wav",
            fairy: "/media/OOT_Fairy.wav",
            goldSkulltula: "/media/OOT_GoldSkulltula_Token.wav",
            magicRefill: "/media/OOT_MagicRefill.wav",
            naviListen: "/media/OOT_Navi_Listen1.wav",
            greatFairyLaugh1: "/media/OOT_GreatFairy_Laugh1.wav"
        };

        return this;
    },

    play ( sound ) {
        this.node[ 0 ].src = this.media[ sound ];
        this.node[ 0 ].play();
    }
};



export default audio;
