module.exports = class PartyBot {
    constructor(telegraf) {
        this.bot = telegraf;
    }
    
    init() {
        this.initCommands();
        this.bot.launch();
    }

    initCommands () {
        this.bot.start((ctx) => ctx.reply('Hello from party bot! Lets get drunk!'));
    }
}