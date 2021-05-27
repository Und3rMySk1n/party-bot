module.exports = class PartyBot {
    constructor(bot) {
        this.bot = bot;
    }
    
    init() {
        this.initCommands();
        this.bot.launch();
    }

    initCommands () {
        this.bot.start((ctx) => ctx.reply('Hello from party bot! Lets get drunk!'));
    }
}