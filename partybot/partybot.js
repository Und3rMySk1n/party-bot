const { Markup } = require('telegraf');

module.exports = class PartyBot {
    constructor(telegraf) {
        this.bot = telegraf;
    }
    
    init() {
        this.initCommands();
        this.bot.launch();
    }

    initCommands() {
        this.bot.start(ctx => ctx.reply('Hello from party bot! Lets get drunk!', this.getMainMenu()));
        this.bot.hears('Пользователи', ctx => ctx.reply('Тут будут пользователи'));
        this.bot.hears('Добавить напиток', ctx => ctx.reply('Тут меню добавления напитков'));
    }
    
    getMainMenu() {
        return Markup.keyboard([
            ['Пользователи', 'Добавить напиток'],
        ]).resize();
    }
}