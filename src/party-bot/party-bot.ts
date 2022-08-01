import { Telegraf, Markup, Context } from 'telegraf';
import { Button } from '../keyboard-service/button';
import { PlayerData, PlayerService } from '../players-service/player-service';
import { User } from 'typegram';
import { dictionary } from '../dictionary/ru';
import { GameStateService } from '../game-state-service/game-state-service';
import { Keyboard } from '../keyboard-service/keyboard';
import * as tg from 'typegram';
import { KeyboardService } from '../keyboard-service/keyboard-service';
import { DrinkData, DrinksService } from '../drinks-service/drinks-service';
import { GameStatsService, PlayerStats } from '../game-stats-service/game-stats-service';

export class PartyBot {
    private telegraf: Telegraf;
    private playersService: PlayerService;
    private drinksService: DrinksService;
    private gameStateService: GameStateService;
    private gameStatsService: GameStatsService;

    private timers: Map<string, ReturnType<typeof setInterval>> = new Map();

    public constructor(
        telegraf: Telegraf,
        playersService: PlayerService,
        drinksService: DrinksService,
        gameStateService: GameStateService,
        gameStatsService: GameStatsService
    ) {
        this.telegraf = telegraf;
        this.playersService = playersService;
        this.drinksService = drinksService;
        this.gameStateService = gameStateService;
        this.gameStatsService = gameStatsService;

        this.initCommands();
        this.telegraf.launch();
    }

    private initCommands() {
        this.telegraf.start(ctx => this.onBotStarted(ctx));

        this.telegraf.hears(Button.Start, ctx => this.onStartButtonPressed(ctx));
        this.telegraf.hears(Button.Stop, ctx => this.onStopButtonPressed(ctx));
        this.telegraf.hears(Button.Settings, ctx => this.onSettingsButtonPressed(ctx));
        this.telegraf.hears(Button.ExitSettings, ctx => this.onExitSettingsButtonPressed(ctx));
        this.telegraf.hears(Button.AddDrink, ctx => this.onAddDrinkButtonPressed(ctx));
        this.telegraf.hears(Button.ClearDrinks, ctx => this.onClearDrinksButtonPressed(ctx));
        this.telegraf.hears(Button.SetTimer, ctx => this.onSetTimerButtonPressed(ctx));
        this.telegraf.hears(Button.Info, ctx => this.onInfoButtonPressed(ctx));
        this.telegraf.hears(Button.Stats, ctx => this.onStatsButtonPressed(ctx));
        this.telegraf.hears(Button.Exit, ctx => this.onExitButtonPressed(ctx));

        this.telegraf.hears('+', ctx => this.onAddPlayer(ctx));
        this.telegraf.hears('-', ctx => this.onDeletePlayer(ctx));

        this.telegraf.on('text', (ctx) => {
            const gameId =  this.gameStateService.getGameId(ctx.message.chat.id);
            const { enteringTimer, enteringDrink } = this.gameStateService.getState(gameId);

            if (enteringDrink) {
                this.gameStateService.setState(gameId, { enteringDrink: false });
                return this.drinksService.addDrink(gameId, ctx.update.message.text)
                    .then(() => ctx.reply(dictionary.drinkEntered));
            }

            if (enteringTimer) {
                this.gameStateService.setState(gameId, { enteringTimer: false });
                return this.gameStateService.setTimer(gameId, ctx.update.message.text)
                    .then(() => ctx.reply(dictionary.timerEntered));
            }
        })
    }

    private onBotStarted(ctx: Context): Promise<tg.Message.TextMessage> {
         const initialized = this.gameStateService.isGameInitialized(ctx.message.chat.id);
         const gameIdPromise = initialized
                ? Promise.resolve(this.gameStateService.getGameId(ctx.message.chat.id))
                : this.gameStateService.initGame(ctx.message.chat.id);

         return gameIdPromise
            .then(gameId => this.gameStateService.isGameStarted(gameId))
            .then(started => ctx.reply(dictionary.startMessage, PartyBot.getInitialKeyboard(started)));
    }

    private onStartButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        const gameId = this.gameStateService.getGameId(ctx.message.chat.id);
        return this.gameStateService.isGameStarted(gameId)
            .then(gameStarted => gameStarted
                ? ctx.reply(dictionary.botAlreadyStarted)
                : this.startGame(ctx)
                    .then(() => ctx.reply(dictionary.startGame, KeyboardService.getGameStartedKeyboard())));
    }

    private onStopButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        const gameId = this.gameStateService.getGameId(ctx.message.chat.id);

        clearInterval(this.timers.get(gameId));
        this.timers.delete(gameId);

        return this.gameStateService.stopGame(gameId)
            .then(() => this.gameStateService.initGame(ctx.message.chat.id))
            .then(() => ctx.reply(dictionary.stopGame, KeyboardService.getGameNotStartedKeyboard()));
    }

    private onSettingsButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        const gameId = this.gameStateService.getGameId(ctx.message.chat.id);

        return Promise.all([
            this.gameStateService.getTimer(gameId),
            this.drinksService.getDrinks(gameId),
            this.playersService.getPlayers(gameId),
        ])
            .then(data => this.prepareInfoMessage(data, dictionary.openSettings))
            .then(settingsMessage => ctx.reply(settingsMessage, KeyboardService.getSettingsKeyboard()));
    }

    private onExitSettingsButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        return ctx.reply(dictionary.settingsSaved, KeyboardService.getGameNotStartedKeyboard());
    }

    private onAddDrinkButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        const gameId = this.gameStateService.getGameId(ctx.message.chat.id);
        this.gameStateService.setState(gameId, { enteringDrink: true });
        return ctx.reply(dictionary.enterDrinkName);
    }

    private onClearDrinksButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        const gameId = this.gameStateService.getGameId(ctx.message.chat.id);
        return this.drinksService.clearDrinksList(gameId)
            .then(() => ctx.reply(dictionary.drinksCleared));
    }

    private onSetTimerButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        const gameId = this.gameStateService.getGameId(ctx.message.chat.id);
        this.gameStateService.setState(gameId, { enteringTimer: true });
        return ctx.reply(dictionary.enterTimer);
    }

    private onInfoButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        const gameId = this.gameStateService.getGameId(ctx.message.chat.id);

        return Promise.all([
            this.gameStateService.getTimer(gameId),
            this.drinksService.getDrinks(gameId),
            this.playersService.getPlayers(gameId),
        ])
            .then(data => this.prepareInfoMessage(data, dictionary.showInfo))
            .then(infoMessage => ctx.reply(infoMessage));
    }

    private prepareInfoMessage(data: Array<number | string[]>, title: string): string {
        const timer = data[0] as number;
        const drinks = data[1] as string[];
        const players = data[2] as string[];

        const drinksAsString = drinks.length
            ? drinks.map(drink => `- ${drink}`).join('\n')
            : dictionary.noDrinksInGame;

        const playersAsString = players.length
            ? players.map(player => `- ${player}`).join('\n')
            : dictionary.noPlayersInGame;

        // TODO: add pluralization
        return `
${title}

${dictionary.playersTitle}:
${playersAsString}

${dictionary.drinksTitle}:
${drinksAsString}

${dictionary.timerTitle}:
${timer} ${dictionary.minutes}
        `;
    }

    private onStatsButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        const gameId = this.gameStateService.getGameId(ctx.message.chat.id);

        return this.gameStatsService.getGameStats(gameId)
            .then(stats => this.prepareStatsMessage(stats))
            .then(statsMessage => ctx.reply(statsMessage));
    }

    private prepareStatsMessage(stats: PlayerStats[]): string {
        const statsMessage = stats.length ? stats.map(p => {
            const playerDrinksMessage = p.drinks.map(d => `- ${d.drinkName} (${d.count})`).join('\n');
            return `
${p.playerName}:
${playerDrinksMessage}`;
        }) : dictionary.noStats;

        return `${dictionary.statsTitle}:
${statsMessage}`;
    }

    private onExitButtonPressed(ctx: Context): Promise<tg.Message.TextMessage> {
        this.gameStateService.deleteGame(ctx.message.chat.id);
        return ctx.reply(dictionary.stopBot, KeyboardService.removeKeyboard());
    }

    private onAddPlayer(ctx: Context): Promise<tg.Message.TextMessage> {
        const gameId = this.gameStateService.getGameId(ctx.message.chat.id);
        if (!this.gameStateService.isGameInitialized(ctx.message.chat.id)) {
            return ctx.reply(dictionary.gameNotStarted)
        }

        const { enteringPlayer } = this.gameStateService.getState(gameId);
        if (!enteringPlayer) {
            return ctx.reply(dictionary.canNotAddUser)
        }

        const playerName = PartyBot.getPlayerName(ctx.message.from);

        // TODO: add getMessage() with optional vars
        return this.playersService.addPlayer(gameId, ctx.message.from.id, playerName)
            .then(() => ctx.reply(`Пользователь ${playerName} в игре!`));
    }

    private onDeletePlayer(ctx: Context) {
        const gameId = this.gameStateService.getGameId(ctx.message.chat.id);
        const { enteringPlayer } = this.gameStateService.getState(gameId);

        if (!enteringPlayer) {
            ctx.reply(dictionary.canNotDeleteUser)
        }

        const playerName = PartyBot.getPlayerName(ctx.message.from);

        // TODO: add getMessage() with optional vars
        return this.playersService.deletePlayer(ctx.message.from.id)
            .then(() => ctx.reply(`Пользователь ${playerName} вышел из игры :(`));
    }

    private startGame(ctx: Context) {
        const chatId = ctx.message.chat.id;
        const gameId = this.gameStateService.getGameId(chatId);

        return this.gameStateService.getTimer(gameId)
            .then(timer => this.addTimer(ctx, gameId, timer))
            .then(() => this.gameStateService.startGame(gameId));
    }

    private static getInitialKeyboard(started: boolean) {
        return started
            ? Markup.keyboard(Keyboard.gameStarted).resize()
            : Markup.keyboard(Keyboard.gameNotStarted).resize();
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

    private addTimer(ctx: Context, gameId: string, timer: number): void {
        const timerInMs = timer * 60 * 1000;

        Promise.all([
            this.playersService.getPlayersWithIds(gameId),
            this.drinksService.getDrinksWithIds(gameId),
        ])
            .then(data => {
                const players: PlayerData[] = data[0];
                const drinks: DrinkData[] = data[1];

                const activeTimer = setInterval(() =>
                    this.choosePlayerToDrink(ctx, gameId, players, drinks),
                    timerInMs);
                this.timers.set(gameId, activeTimer);
            });
    }

    private choosePlayerToDrink(
        ctx: Context,
        gameId: string,
        players: PlayerData[],
        drinks: DrinkData[]
    ): Promise<tg.Message.TextMessage> {
        const randomPlayerIndex = Math.floor(Math.random() * players.length);
        const randomPlayer = players[randomPlayerIndex];

        const randomDrinkIndex = Math.floor(Math.random() * drinks.length);
        const randomDrink = drinks[randomDrinkIndex];

        // TODO: add getMessage() with optional vars
        const drinkMessage = `${randomPlayer.name} пьет напиток: ${randomDrink.name}!`;
        return this.gameStatsService.addPlayerWithDrink(gameId, randomPlayer.id, randomDrink.id)
            .then(() => ctx.reply(drinkMessage));
    }
}