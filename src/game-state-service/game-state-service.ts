import { DbService } from '../db-service/db-service';

export interface GameState {
    playersCount: number;
    drinksCount: number;
    gameStart: number;
    timer: number;
}

export class GameStateService {
    private dbService;
    private defaultTimer = 30 * 1000;

    constructor(dbService: DbService) {
        this.dbService = dbService;
    }

    public initGame(chatId: number): Promise<string> {
        const gameId = `${chatId}-${Date.now()}`;
        return this.dbService.addGame(chatId, gameId)
            .then(() => this.dbService.addInitialGameState(gameId, this.defaultTimer))
            .then(() => gameId);
    }

    public startGame(gameId: string): void {
        const startTimestamp = Date.now();
        this.dbService.updateGameStart(gameId, startTimestamp);
    }

    public stopGame(chatId: number): void {
        this.dbService.deleteGame(chatId);
    }

    public getGameId(chatId: number): Promise<string> {
        return this.dbService.getGameId(chatId);
    }

    public isGameInitialized(chatId: number): Promise<boolean> {
        return this.dbService.getGameId(chatId).then(gameId => !!gameId);
    }

    public isGameStarted(gameId: string): Promise<boolean> {
        return this.dbService.getGameState(gameId)
            .then(gameStateFromQuery => {
                const gameState = this.convertGameStateFromQuery(gameStateFromQuery);
                return !!gameState.gameStart;
            })
    }

    private convertGameStateFromQuery(stateFromQuery: string[]): GameState {
        return {
            playersCount: parseInt(stateFromQuery[0], 10),
            drinksCount: parseInt(stateFromQuery[1], 10),
            gameStart: parseInt(stateFromQuery[2], 10),
            timer: parseInt(stateFromQuery[3], 10),
        };
    }
}