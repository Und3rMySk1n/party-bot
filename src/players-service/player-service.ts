import { DbService } from '../db-service/db-service';

export interface PlayerData {
    id: number;
    name: string;
}

export class PlayerService {
    private dbService;

    constructor(dbService: DbService) {
        this.dbService = dbService;
    }

    public getPlayers(gameId: string): Promise<string[]> {
        return this.dbService.getPlayers(gameId);
    }

    public getPlayersWithIds(gameId: string): Promise<PlayerData[]> {
        return this.dbService.getPlayersWithIds(gameId).then(data => data.map(playerData => ({
            id: parseInt(playerData[0], 10),
            name: playerData[1],
        })));
    }

    public addPlayer(gameId: string, playerId: number, playerName: string): Promise<void> {
        return this.dbService.addPlayer(gameId, playerId, playerName);
    }

    public deletePlayer(playerId: number): Promise<void> {
        return this.dbService.deletePlayer(playerId);
    }
}