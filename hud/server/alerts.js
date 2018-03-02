"use strict";



module.exports = {
    name: "alerts",
    init ( app ) {
        this.app = app;

        app.lager.server( `[${this.name}] utility initialized` );
    },
    host ( username, viewers ) {
        return `
        <h1 class="yellow">Host</h1>
        <p><span class="teal">${username}</span> is now hosting you with a viewing party of <span class="teal">${viewers}</span>! Welcome to the channel!</p>
        `;
    },
    sub ( username, message, method ) {
        return `
            <h1 class="yellow">Sub</h1>
            <p><span class="teal">${username}</span> just subscribed to the channel! <span class="yellow">${message ? message : "&hellip;"}</span></p>
        `;
    },
    resub ( username, message, months, methods ) {
        return `
            <h1 class="yellow">Resub</h1>
            <p><span class="teal">${username}</span> has resubscribed to the channel for <span class="teal">${months}</span> months in a row! <span class="yellow">${message ? message : "&hellip;"}</span></p>
        `;
    },
    cheer ( userstate, message ) {
        return `
            <h1 class="purple">Cheer</h1>
            <p><span class="teal">${userstate.username}</span> has just cheered <span class="teal">${userstate.bits}</span> bits! <span class="yellow">${message ? message : "&hellip;"}</span></p>
        `;
    },
    follow ( username ) {
        return `
            <h1 class="yellow">Follow</h1>
            <p><span class="teal">${username}</span> is now following the channel!</p>
        `;
    },
    heartThief ( userstate, num ) {
        return `
            <h1 class="red">Heart Thief</h1>
            <p><span class="teal">${userstate.username}</span> has stolen a heart! You only have <span class="teal">${this.app.data.hearts.value}</span> ${this.app.data.hearts.value > 1 ? "hearts" : "heart"} left&hellip;</p>
        `;
    },
    heartCounter () {
        return `
            <h1 class="red">Heart Timeout</h1>
            <p>Has it been 10 minutes already!? You lost one of your hearts! You only have <span class="teal">${this.app.data.hearts.value}</span> ${this.app.data.hearts.value > 1 ? "hearts" : "heart"} left&hellip;</p>
        `;
    },
    fairyBottle ( userstate ) {
        return `
            <h1 class="blue">Fairy Bottle</h1>
            <p><span class="teal">${userstate.username}</span> gave you a fairy in a bottle! You now have <span class="teal">${this.app.data.hearts.value}</span> whole hearts!</p>
        `;
    },
    fairyFinder ( userstate, hit ) {
        return `
            <h1 class="pink">Fairy Finder</h1>
            <p><span class="teal">${userstate.username}</span> caught a fairy with a hit percent of <span class="teal">${hit}</span>! We now have <span class="teal">${this.app.data.fairies.value}</span> out of <span class="teal">${this.app.data.fairies.max}</span> fairies!</p>
        `;
    },
    fairyFinderLeader ( fairyFinder ) {
        return `
            <h1 class="pink">Fairy Finder</h1>
            <p><span class="teal">${fairyFinder.username}</span> caught <span class="pink">${fairyFinder.fairies}</span> fairies!</p>
        `;
    },
    heartThiefLeader ( heartThief ) {
        return `
            <h1 class="red">Heart Thief</h1>
            <p><span class="teal">${heartThief.username}</span> slashed <span class="red">${heartThief.hearts}</span> hearts!</p>
        `;
    },
    fairyBottleLeader ( fairyBottle ) {
        return `
            <h1 class="teal">Fairy Bottle</h1>
            <p><span class="teal">${fairyBottle.username}</span> used <span class="teal">${fairyBottle.bottles}</span> fairy bottles!</p>
        `;
    },
    mazeRunnerLeader ( mazeRunner ) {
        return `
            <h1 class="teal">Maze Runner</h1>
            <p><span class="teal">${mazeRunner.username}</span> completed <span class="teal">${mazeRunner.mazes}</span> mazes!</p>
        `;
    },
    mazeRunnerWin ( player ) {
        return `
            <h1 class="teal">Maze Runner</h1>
            <p><span class="teal">${player.username}</span> completed the labyrinth using a total of <span class="teal">${player.moves}</span> moves!</p>
        `;
    }
};
