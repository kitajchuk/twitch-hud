module.exports = {
    // https://dev.twitch.tv/docs/irc
    // https://www.npmjs.com/package/tmi.js
    tmi: require( "./tmi" ),

    // https://dev.twitch.tv/docs/api
    // https://www.npmjs.com/package/twitch-helix
    helix: require( "./helix" ),

    // https://dev.twitch.tv/docs/v5
    kraken: require( "./kraken" ),

    // Data store in memo
    memo: {}
};
