module.exports = {
    name: "twitch kraken",
    memo: {},
    init ( app ) {
        this.app = app;

        this.app.lager.server( `[${this.name}] utility initialized` );
    }
};
