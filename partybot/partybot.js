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
        this.bot.hears('Хватит', ctx => ctx.reply('До встречи! Если что, ты знаешь, где меня найти: /start', this.removeKeyboard));
    }
    
    getMainMenu() {
        return Markup.keyboard([
            ['Пользователи', 'Добавить напиток', 'Хватит'],
        ]).resize();
    }
    
    removeKeyboard() {
        return Markup.removeKeyboard(true);
    }
}