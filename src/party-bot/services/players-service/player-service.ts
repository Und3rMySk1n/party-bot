import { DbService, PlayerData } from '../db-service/db-service';

export class PlayerService {
    private dbService;

    constructor(dbService: DbService) {
        this.dbService = dbService;
    }

    public getPlayers(gameId: string): Promise<string[]> {
        return this.dbService.getPlayers(gameId);
    }

    public getPlayersWithIds(gameId: string): Promise<PlayerData[]> {
        return this.dbService.getPlayersWithIds(gameId);
    }

    public addPlayer(gameId: string, rawPlayerId: number, playerName: string): Promise<void> {
        return this.dbService.addPlayer(gameId, this.getPlayerIdInGame(gameId, rawPlayerId), playerName);
    }

    public deletePlayer(gameId: string, rawPlayerId: number): Promise<void> {
        return this.dbService.deletePlayer(this.getPlayerIdInGame(gameId, rawPlayerId));
    }

    private getPlayerIdInGame(gameId: string, rawPlayerId: number): string {
        return `${gameId}-${rawPlayerId}`;
    }
}