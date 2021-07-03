import { Telegraf, Markup, Context } from 'telegraf';
import { Buttons } from './buttons';
import { UsersService } from '../users-service/users-service';
import { User } from 'typegram';

export class PartyBot {
    private telegraf: Telegraf;
    private usersService: UsersService;
    private interval: number = 0;
    private gameStarted: boolean = false;
    
    public constructor(telegraf: Telegraf, usersService: UsersService) {
        this.telegraf = telegraf;
        this.usersService = usersService;
    }
    
    public init() {
        this.initCommands();
        this.telegraf.launch();
    }

    private initCommands() {
        this.telegraf.start(ctx => ctx.reply(`
                Hello from party bot!
                Lets get drunk! If you're in, send me "+".
                If you're out, send me "-" and go home :)
            `, PartyBot.getStartMenu()));

        this.telegraf.hears('+', ctx => ctx.reply(this.addUser(ctx)));
        this.telegraf.hears('-', ctx => ctx.reply(this.deleteUser(ctx)));

        this.telegraf.hears(Buttons.Start, ctx => ctx.reply('Погнали! И тут кнопка меняется на старт.'));
        this.telegraf.hears(Buttons.Settings, ctx => ctx.reply('Тут будут настройки. Можно их поменять.'));
        this.telegraf.hears(Buttons.Info, ctx => ctx.reply('Тут будет текущее состояние: таймер, список напитков и участники'));
        this.telegraf.hears(Buttons.Exit, ctx => ctx.reply('До встречи! Если что, ты знаешь, где меня найти: /start', PartyBot.removeKeyboard()));
    }

    private addUser(ctx: Context): string {
        const chatId = ctx.message.chat.id;
        const userName = PartyBot.getUserName(ctx.message.from);
        this.usersService.addUser(userName);
        return `Chat: ${chatId} | Пользователь ${userName} в игре!`;
    }
    
    private deleteUser(ctx: Context): string {
        const userName = PartyBot.getUserName(ctx.message.from);
        this.usersService.deleteUser(userName);
        return `Пользователь ${userName} вышел из игры :(`;
    }
    
    private static getStartMenu() {
        return Markup.keyboard([
            [Buttons.Start, Buttons.Settings, Buttons.Info, Buttons.Exit],
        ]).resize();
    }
    
    private static removeKeyboard() {
        return Markup.removeKeyboard();
    }
    
    private static getUserName(user: User): string {
        const firstName = user.first_name;
        const lastName = user.last_name;
        const userName = user.username;
        
        if (firstName || lastName) {
            return `${firstName} ${lastName}`;
        }
        
        return userName;
    }
}