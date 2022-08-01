import { DbService } from '../db-service/db-service';
import { PlayerData, PlayerService } from '../players-service/player-service';
import { DrinkData, DrinksService } from '../drinks-service/drinks-service';

export interface DrinksStats {
    drinkName: string;
    count: number;
}

export interface PlayerStats {
    playerName: string;
    drinks: DrinksStats[];
}

export class GameStatsService {
    private dbService;
    private playersService: PlayerService;
    private drinksService: DrinksService;

    constructor(
        dbService: DbService,
        playersService: PlayerService,
        drinksService: DrinksService
    ) {
        this.dbService = dbService;
        this.playersService = playersService;
        this.drinksService = drinksService;
    }

    public addPlayerWithDrink(gameId: string, playerId: number, drinkId: string): Promise<void> {
        return this.dbService.addPlayerWithDrink(gameId, playerId, drinkId);
    }

    public getGameStats(gameId: string): Promise<PlayerStats[]> {
        return Promise.all([
            this.playersService.getPlayersWithIds(gameId),
            this.drinksService.getDrinksWithIds(gameId),
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
            const playerId = parseInt(stat[0], 10);
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