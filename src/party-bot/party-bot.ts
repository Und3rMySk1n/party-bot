import { Telegraf, Markup, Context } from 'telegraf';
import { Button } from '../keyboard/button';
import { PlayerService } from '../players-service/player-service';
import { User } from 'typegram';
import { dictionary } from '../dictionary/ru';
import { GameStateService } from '../game-state-service/game-state-service';
import { Keyboard } from '../keyboard/keyboard';
import * as tg from 'typegram';

export class PartyBot {
    private telegraf: Telegraf;
    private playersService: PlayerService;
    private gameStateService: GameStateService;

    public constructor(
        telegraf: Telegraf,
        playersService: PlayerService,
        gameStateService: GameStateService
    ) {
        this.telegraf = telegraf;
        this.playersService = playersService;
        this.gameStateService = gameStateService;

        this.initCommands();
        this.telegraf.launch();
    }

    private initCommands() {
        this.telegraf.start(ctx => this.onBotStarted(ctx));

        this.telegraf.hears(Button.Start, ctx => this.onStartButtonPressed(ctx));
        this.telegraf.hears(Button.Stop, ctx => this.onStopButtonPressed(ctx));
        this.telegraf.hears(Button.Settings, ctx => this.onSettingsButtonPressed(ctx));
        this.telegraf.hears(Button.Info, ctx => this.onInfoButtonPressed(ctx));
        this.telegraf.hears(Button.Exit, ctx => this.onExitButtonPressed(ctx));

        // TODO: Unsubscribe after close bot
        this.telegraf.hears('+', ctx => this.onAddPlayer(ctx));
        this.telegraf.hears('-', ctx => this.onDeletePlayer(ctx));
    }

    private onBotStarted(ctx: Context): Promise<tg.Message.TextMessage> {
        return this.gameStateService.isGameInitialized(ctx.message.chat.id)
            .then(initialized => initialized
                ? this.gameStateService.getGameId(ctx.message.chat.id)
                : this.initGame(ctx.message.chat.id))
            .then(gameId => this.gameStateService.isGameStarted(gameId))
            .then(started => ctx.reply(dictionary.startMessage, PartyBot.getInitialKeyboard(started)));
    }

    private onStartButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        return this.gameStateService.getGameId(ctx.message.chat.id)
            .then(gameId => this.gameStateService.isGameStarted(gameId))
            .then(gameStarted => gameStarted
                ? ctx.reply(dictionary.botAlreadyStarted)
                : this.gameStateService.getGameId(ctx.message.chat.id)
                    .then(gameId => ctx.reply(dictionary.startGame, this.startGame(gameId))));
    }

    private onStopButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        return ctx.reply(dictionary.stopGame, this.stopGame(ctx));
    }

    private onSettingsButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        return ctx.reply(dictionary.openSettings);
    }

    private onInfoButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        return ctx.reply(dictionary.showInfo);
    }

    private onExitButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        return ctx.reply(dictionary.stopBot, PartyBot.removeKeyboard())
    }

    private onAddPlayer(ctx: Context): Promise<tg.Message.TextMessage> {
        const playerName = PartyBot.getPlayerName(ctx.message.from);

        // TODO: add getMessage() with optional vars
        return this.playersService.addPlayer(ctx.message.chat.id, ctx.message.from.id, playerName)
            .then(() => ctx.reply(`Пользователь ${playerName} в игре!`));
    }

    private onDeletePlayer(ctx: Context) {
        const playerName = PartyBot.getPlayerName(ctx.message.from);

        // TODO: add getMessage() with optional vars
        return this.playersService.deletePlayer(ctx.message.chat.id, ctx.message.from.id)
            .then(() => ctx.reply(`Пользователь ${playerName} вышел из игры :(`));
    }

    private initGame(chatId: number): Promise<string> {
        return this.gameStateService.initGame(chatId);
    }

    private startGame(gameId: string) {
        this.gameStateService.startGame(gameId);
        return Markup.keyboard(Keyboard.gameStarted).resize();
    }

    private stopGame(ctx: Context) {
        this.gameStateService.stopGame(ctx.message.chat.id);
        return Markup.keyboard(Keyboard.gameNotStarted).resize();
    }

    private static getInitialKeyboard(started: boolean) {
        return started
            ? Markup.keyboard(Keyboard.gameStarted).resize()
            : Markup.keyboard(Keyboard.gameNotStarted).resize();
    }

    private static removeKeyboard() {
        return Markup.removeKeyboard();
    }

    private static getPlayerName(player: User): string {
        const firstName = player.first_name;
        const lastName = player.last_name;
        const playerName = player.username;

        if (firstName || lastName) {
            return `${firstName} ${lastName}`;
        }

        return playerName;
    }
}