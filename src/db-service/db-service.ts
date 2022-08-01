import { Client, Query } from 'ts-postgres';

export class DbService {
    private client;
    private connected;

    constructor() {
        this.client = new Client({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
        this.connected = new Promise<void>((resolve) => {
            this.client.connect().then(() => resolve())
        });
    }

    public deleteGameData(gameId: string): Promise<void> {
        const deleteDrinksQuery = new Query(
            "DELETE FROM drink WHERE drinkid IN (SELECT drinkid FROM drinkingame WHERE gameid = $1)",
            [gameId]
        );

        const deleteDrinksInGameQuery = new Query(
            "DELETE FROM drinkingame WHERE gameid = $1",
            [gameId]
        );

        const deletePlayersQuery = new Query(
            "DELETE FROM player WHERE playerid IN (SELECT playerid FROM playeringame WHERE gameid = $1)",
            [gameId]
        );

        const deletePlayersInGameQuery = new Query(
            "DELETE FROM playeringame WHERE gameid = $1",
            [gameId]
        );

        const deleteStatsQuery = new Query(
            "DELETE FROM gamestats WHERE gameId = $1",
            [gameId]
        );

        const deleteStateQuery = new Query(
            "DELETE FROM gamestate WHERE gameId = $1",
            [gameId]
        );

        return this.connected
            .then(() => this.client.execute(deleteDrinksQuery))
            .then(() => this.client.execute(deleteDrinksInGameQuery))
            .then(() => this.client.execute(deletePlayersQuery))
            .then(() => this.client.execute(deletePlayersInGameQuery))
            .then(() => this.client.execute(deleteStatsQuery))
            .then(() => this.client.execute(deleteStateQuery));
    }

    public deleteGame(chatId: string): Promise<void> {
        const query = new Query(
            "DELETE FROM game WHERE chatid = $1",
            [chatId]
        );
        return this.connected.then(() => this.client.execute(query));
    }

    public getPlayers(gameId: string): Promise<string[]> {
        const query = new Query(
            `SELECT playername
                  FROM player
                  JOIN playeringame ON player.playerid = playeringame.playerid
                  WHERE gameid = $1`,
            [gameId]
        );

        return this.connected.then(() => this.client.execute(query)).then(result => result.rows);
    }

    public getPlayersWithIds(gameId: string): Promise<any> {
        const query = new Query(
            `SELECT player.playerid, player.playername
                  FROM player
                  JOIN playeringame ON player.playerid = playeringame.playerid
                  WHERE playeringame.gameid = $1`,
            [gameId]
        );

        return this.connected.then(() => this.client.execute(query)).then(result => result.rows);
    }

    public addPlayer(gameId: string, playerId: number, playerName: string): Promise<void> {
        const addPlayerInGameQuery = new Query(
            "INSERT INTO playeringame VALUES ($1, $2)",
            [gameId, playerId]
        );

        const addPlayerQuery = new Query(
            "INSERT INTO player VALUES ($1, $2)",
            [playerId, playerName]
        );

        return this.connected.then(() => this.client.execute(addPlayerInGameQuery))
            .then(() => this.client.execute(addPlayerQuery));
    }

    public deletePlayer(playerId: number): Promise<void> {
        const deletePlayerInGameQuery = new Query(
            "DELETE FROM playeringame WHERE playerid = $1",
            [playerId]
        );

        const deletePlayerQuery = new Query(
            "DELETE FROM player WHERE playerid = $1",
            [playerId]
        );

        return this.connected.then(() => this.client.execute(deletePlayerInGameQuery))
            .then(() => this.client.execute(deletePlayerQuery));
    }

    public getDrinks(gameId: string): Promise<string[]> {
        const query = new Query(
            `SELECT drinkname FROM drink
                  INNER JOIN drinkingame ON drinkingame.drinkid = drink.drinkid
                  WHERE drinkingame.gameid = $1
                  `,
            [gameId]
        );

        return this.connected.then(() => this.client.execute(query)).then(result => result.rows.flat());
    }

    public getDrinksWithIds(gameId: string): Promise<any> {
        const query = new Query(
            `SELECT drink.drinkid, drink.drinkname FROM drink
                  INNER JOIN drinkingame ON drinkingame.drinkid = drink.drinkid
                  WHERE drinkingame.gameid = $1
                  `,
            [gameId]
        );

        return this.connected.then(() => this.client.execute(query)).then(result => result.rows);
    }

    public addDrink(gameId: string, drinkId: number, drinkName: string): Promise<void> {
        const addDrinkInGameQuery = new Query(
            "INSERT INTO drinkingame VALUES ($1, $2)",
            [gameId, drinkId]
        );

        const addDrinkQuery = new Query(
            "INSERT INTO drink VALUES ($1, $2)",
            [drinkId, drinkName]
        );

        return this.connected.then(() => this.client.execute(addDrinkInGameQuery))
            .then(() => this.client.execute(addDrinkQuery));
    }

    public clearDrinksList(gameId: string): Promise<void> {
        const deleteDrinksQuery = new Query(
            "DELETE FROM drink WHERE drinkid IN (SELECT drinkid FROM drinkingame WHERE gameid = $1)",
            [gameId]
        );

        const deleteDrinksInGameQuery = new Query(
            "DELETE FROM drinkingame WHERE gameid = $1",
            [gameId]
        );

        return this.connected
            .then(() => this.client.execute(deleteDrinksQuery))
            .then(() => this.client.execute(deleteDrinksInGameQuery));
    }

    public addInitialGameState(gameId: string, timer: number): Promise<void> {
        const query = new Query(
            `
                  INSERT INTO gamestate
                  (gameid, playerscount, drinkscount, gamestart, timer)
                  VALUES
                  ($1, 0, 0, NULL, $2)
                  `,
            [gameId, timer]
        );
        return this.connected.then(() => this.client.execute(query));
    }

    public getGameState(gameId: string): Promise<string[]> {
        const query = new Query(
            "SELECT (playerscount, drinkscount, gamestart, timer) FROM gamestate WHERE gameid = $1",
            [gameId]
        );
        return this.connected.then(() => this.client.execute(query));
    }

    public updateGameStart(gameId: string, gameStart: number): Promise<void> {
        const query = new Query(
            "UPDATE gamestate SET gamestart = $1 WHERE gameId = $2",
            [gameStart, gameId]
        );
        return this.connected.then(() => this.client.execute(query));
    }

    public setTimer(gameId: string, timer: number): Promise<void> {
        const query = new Query(
            "UPDATE gamestate SET timer = $1 WHERE gameid = $2",
            [timer, gameId]
        );
        return this.connected.then(() => this.client.execute(query));
    }

    public getTimer(gameId: string): Promise<number> {
        const query = new Query(
            "SELECT timer FROM gamestate WHERE gameid = $1",
            [gameId]
        );
        return this.connected
            .then(() => this.client.execute(query))
            .then(result => parseInt(result.rows[0][0], 10));
    }

    public addPlayerWithDrink(gameId: string, playerId: number, drinkId: string): Promise<void> {
        const query = new Query(
            "INSERT INTO gamestats (gameid, playerid, drinkid) VALUES ($1, $2, $3)",
            [gameId, playerId, drinkId]
        );
        return this.connected.then(() => this.client.execute(query));
    }

    public getStats(gameId: string): Promise<string[][]> {
        const query = new Query(
            "SELECT playerid, drinkid FROM gamestats WHERE gameid = $1",
            [gameId]
        );
        return this.connected.then(() => this.client.execute(query)).then(result => result.rows);
    }
}