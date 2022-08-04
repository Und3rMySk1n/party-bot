import { DbService } from '../db-service/db-service';

export interface GameState {
    enteringPlayer: boolean;
    enteringDrink: boolean;
    enteringTimer: boolean;
}

export interface GameSettings {
    gameStart: number;
    timer: number;
}

export class GameStateService {
    private dbService;
    private defaultTimer = 5 * 60 * 1000 // 5 minutes;

    private currentGamesMap: Map<number, string> = new Map();
    private gameStatesMap: Map<string, GameState> = new Map();

    constructor(dbService: DbService) {
        this.dbService = dbService;
    }

    public initGame(chatId: number): Promise<string> {
        const gameId = `${chatId}-${Date.now()}`;

        this.currentGamesMap.set(chatId, gameId);
        this.gameStatesMap.set(gameId, {
            enteringPlayer: true,
            enteringDrink: false,
            enteringTimer: false,
        });

        return this.dbService.addInitialGameState(gameId, this.defaultTimer)
            .then(() => gameId);
    }

    public startGame(gameId: string): Promise<void> {
        this.setState(gameId, { enteringPlayer: false });
        const startTimestamp = Date.now();
        return this.dbService.updateGameStart(gameId, startTimestamp);
    }

    public stopGame(gameId: string): Promise<void> {
        this.setState(gameId, { enteringPlayer: true });
        return this.dbService.deleteGameData(gameId);
    }
    
    public deleteGame(chatId: number): void {
        this.currentGamesMap.delete(chatId);
    }

    public getGameId(chatId: number): string {
        return this.currentGamesMap.get(chatId);
    }

    public isGameInitialized(chatId: number): boolean {
        return this.currentGamesMap.has(chatId);
    }

    public isGameStarted(gameId: string): Promise<boolean> {
        return this.dbService.getGameState(gameId)
            .then(gameStateFromQuery => {
                const gameState = this.convertGameStateFromQuery(gameStateFromQuery);
                return !!gameState.gameStart;
            })
    }

    public getState(gameId: string): GameState {
        return this.gameStatesMap.get(gameId);
    }

    public setState(gameId: string, newState: Partial<GameState>): void {
        if (!this.gameStatesMap.has(gameId)) {
            throw Error('No current game with this game id');
        }

        this.gameStatesMap.set(gameId, {
            ...this.gameStatesMap.get(gameId),
            ...newState,
        })
    }

    public setTimer(gameId: string, timer: string): Promise<void> {
        const timerInMs = parseInt(timer, 10) * 60 * 1000;
        return this.dbService.setTimer(gameId, timerInMs);
    }

    public getTimer(gameId: string): Promise<number> {
        return this.dbService.getTimer(gameId)
            .then(timerInMs => timerInMs / 60 / 1000);
    }

    private convertGameStateFromQuery(stateFromQuery: string[]): GameSettings {
        return {
            gameStart: parseInt(stateFromQuery[2], 10),
            timer: parseInt(stateFromQuery[3], 10),
        };
    }
}