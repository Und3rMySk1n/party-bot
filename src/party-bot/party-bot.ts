import { Telegraf, Markup } from 'telegraf';

export class PartyBot {
    private bot: Telegraf;
    
    public constructor(telegraf: Telegraf) {
        this.bot = telegraf;
    }
    
    public init() {
        this.initCommands();
        this.bot.launch();
    }

    private initCommands() {
        this.bot.start(ctx => ctx.reply('Hello from party bot! Lets get drunk!', PartyBot.getMainMenu()));
        this.bot.hears('Пользователи', ctx => ctx.reply('Тут будут пользователи'));
        this.bot.hears('Добавить напиток', ctx => ctx.reply('Тут меню добавления напитков'));
        this.bot.hears('Хватит', ctx => ctx.reply('До встречи! Если что, ты знаешь, где меня найти: /start', PartyBot.removeKeyboard()));
    }
    
    private static getMainMenu() {
        return Markup.keyboard([
            ['Пользователи', 'Добавить напиток', 'Хватит'],
        ]).resize();
    }
    
    private static removeKeyboard() {
        return Markup.removeKeyboard();
    }
}