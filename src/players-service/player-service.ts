import { DbService } from '../db-service/db-service';
import { NoRunningGameError } from '../errors/errors';

export class PlayerService {
    private dbService;

    constructor(dbService: DbService) {
        this.dbService = dbService;
    }

    public getPlayers(chatId: number): Promise<string[]> {
        return this.dbService.getGameId(chatId).then(gameId => {
            if (!gameId) {
                throw new NoRunningGameError('No game running');
            }

            return this.dbService.getPlayers(gameId);
        });
    }

    public addPlayer(chatId: number, playerId: number, playerName: string): Promise<void> {
        return this.dbService.getGameId(chatId).then(gameId => {
            if (!gameId) {
                throw new NoRunningGameError('No game running');
            }

            return this.dbService.addPlayer(gameId, playerId, playerName);
        })
    }

    public deletePlayer(chatId: number, playerId: number): Promise<void> {
        return this.dbService.getGameId(chatId).then(gameId => {
            if (!gameId) {
                throw new NoRunningGameError('No game running');
            }

            return this.dbService.deletePlayer(playerId);
        });
    }
}