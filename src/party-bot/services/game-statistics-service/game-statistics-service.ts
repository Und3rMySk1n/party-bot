import { DbService, DrinkData, PlayerData } from '../db-service/db-service';

export interface DrinksStats {
    drinkName: string;
    count: number;
}

export interface PlayerStats {
    playerName: string;
    drinks: DrinksStats[];
}

export class GameStatisticsService {
    private dbService;

    constructor(dbService: DbService) {
        this.dbService = dbService;
    }

    public addPlayerWithDrink(gameId: string, playerId: string, drinkId: string): Promise<void> {
        return this.dbService.addPlayerWithDrink(gameId, playerId, drinkId);
    }

    public getGameStats(gameId: string): Promise<PlayerStats[]> {
        return Promise.all([
            this.dbService.getPlayersWithIds(gameId),
            this.dbService.getDrinksWithIds(gameId),
            this.dbService.getStats(gameId),
        ])
            .then(data => {
                const players: PlayerData[] = data[0];
                const drinks: DrinkData[] = data[1];
                const stats: string[][] = data[2];

                return this.getStatsByPlayer(players, drinks, stats);
            })
    }

    private getStatsByPlayer(players: PlayerData[], drinks: DrinkData[], stats: string[][]): PlayerStats[] {
        const playerStats: PlayerStats[] = [];

        stats.forEach(stat => {
            const playerId = stat[0];
            const player = players.find(p => p.id === playerId);

            const drinkId = stat[1];
            const drink = drinks.find(d => d.id === drinkId);

            if (!drink || !player) {
                throw Error('Drink or player not found in game.');
            }

            const playerName = player.name;
            const drinkName = drink.name;
            const playerStat = playerStats.find(ps => ps.playerName === playerName);

            if (!playerStat) {
                playerStats.push({
                    playerName,
                    drinks: [{
                        drinkName,
                        count: 1,
                    }],
                });
                return;
            }

            const playerDrink = playerStat.drinks.find(d => d.drinkName === drinkName);
            if (!playerDrink) {
                playerStat.drinks.push({
                    drinkName,
                    count: 1,
                });
                return;
            }

            ++playerDrink.count;
        });

        return playerStats;
    }
}