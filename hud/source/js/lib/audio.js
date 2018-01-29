import $ from "properjs-hobo";
import Tween from "properjs-tween";
import Easing from "properjs-easing";



const audio = {
    init () {
        this.nodeFx = $( ".js-hud-audio-fx" );
        this.nodeBgm = $( ".js-hud-audio-bgm" );
        this.nodeFx[ 0 ].volume = 1;
        this.nodeBgm[ 0 ].volume = 0.5;
        this.media = {
            fx: {
                item: "/media/fx/08_Item_Catch.wav",
                smallItem: "/media/fx/09_Small_Item_Catch.wav",
                heartContainer: "/media/fx/15_Heart_Container_Get.wav",
                getHeart: "/media/fx/OOT_Get_Heart.wav",
                scream1: "/media/fx/OOT_YoungLink_Scream1.wav",
                scream2: "/media/fx/OOT_YoungLink_Scream2.wav",
                fairy: "/media/fx/OOT_Fairy.wav",
                goldSkulltula: "/media/fx/OOT_GoldSkulltula_Token.wav",
                magicRefill: "/media/fx/OOT_MagicRefill.wav",
                naviListen: "/media/fx/OOT_Navi_Listen1.wav",
                greatFairyLaugh1: "/media/fx/OOT_GreatFairy_Laugh1.wav",
                fairyOcarinaGet: "/media/fx/18_Fairy_Ocarina_Get.wav",
                openTreasureBox: "/media/fx/07_Open_Treasure_Box.wav",
                spiritualStoneGet: "/media/fx/17_Spiritual_Stone_Get.wav",
                greatFairyFountain: "/media/fx/40_Great_Fairy_Fountain.wav"
            },
            bgm: {
                titleTheme: "/media/bgm/01_Title_Theme.wav",
                kokiriForest: "/media/bgm/06_Kokiri_Forest.wav",
                hyruleField: "/media/bgm/19_Hyrule_Field_Main_Theme.wav",
                lonLonRanch: "/media/bgm/28_Lon_Lon_Ranch.wav",
                kakarikoVillage: "/media/bgm/30_Kakariko_Village.wav",
                lostWoods: "/media/bgm/35_Lost_Woods.wav",
                gerudoValley: "/media/bgm/68_Gerudo_Valley.wav",
                keporaGebora: "/media/bgm/20_Kepora_Geboras_Theme.wav",
                marketTheme: "/media/bgm/21_Market.wav",
                goronCity: "/media/bgm/33_Goron_City.wav",
                zorasDomain: "/media/bgm/39_Zoras_Domain.wav"
            }
        };

        this.background();

        return this;
    },

    play ( sound ) {
        this.nodeFx[ 0 ].src = this.media.fx[ sound ];
        this.nodeFx[ 0 ].play();
    },

    stop () {
        this.tweenFx = new Tween({
            from: 1,
            to: 0,
            ease: Easing.easeOutQuad,
            update: ( vol ) => {
                this.nodeFx[ 0 ].volume = vol;
            },
            complete: () => {
                this.nodeFx[ 0 ].src = "";
                this.nodeFx[ 0 ].volume = 1;
            }
        });
    },

    background () {
        const tunes = Object.keys( this.media.bgm );
        let tune = tunes[ Math.floor( Math.random() * (tunes.length - 1)) ];
        let lastTune = tune;

        this.nodeBgm.on( "ended", () => {
            while ( tune === lastTune ) {
                tune = tunes[ Math.floor( Math.random() * (tunes.length - 1)) ];
            }

            lastTune = tune;

            this.nodeBgm[ 0 ].src = this.media.bgm[ tune ];
            this.nodeBgm[ 0 ].play();
        });

        this.nodeBgm[ 0 ].src = this.media.bgm[ tune ];
        this.nodeBgm[ 0 ].play();
    },

    backgroundPause () {
        this.nodeBgm[ 0 ].pause();
    },

    backgroundResume () {
        this.nodeBgm[ 0 ].play();
    },

    backgroundQuiet ( bool ) {
        this.tweenBgm = new Tween({
            from: (bool ? 0.5 : 0),
            to: (bool ? 0 : 0.5),
            ease: Easing.easeOutQuad,
            update: ( vol ) => {
                this.nodeBgm[ 0 ].volume = vol;
            },
            complete: ( vol ) => {
                this.nodeBgm[ 0 ].volume = vol;
            }
        });
    }
};



export default audio;
