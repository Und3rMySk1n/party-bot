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

    public addGame(chatId: number, gameId: string): Promise<void> {
        const query = new Query(
            "INSERT INTO game VALUES ($1, $2)",
            [chatId, gameId]
        );
        return this.connected.then(() => this.client.execute(query));
    }

    public deleteGame(chatId: string): Promise<void> {
        const query = new Query(
            "DELETE FROM game WHERE chatid = $1",
            [chatId]
        );
        return this.connected.then(() => this.client.execute(query));
    }

    public getGameId(chatId: number): Promise<string> {
        const query = new Query(
            "SELECT gameid from game WHERE chatid = $1",
            [chatId]
        );
        return this.connected.then(() => this.client.execute(query)).then(result => result.rows[0]);
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

    public addPlayer(gameId: string, playerId: number, playerName: string): Promise<void> {
        const addPlayerInGameQuery = new Query(
            "INSERT into playeringame VALUES ($1, $2)",
            [gameId, playerId]
        );

        const addPlayerQuery = new Query(
            "INSERT into player VALUES ($1, $2)",
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

    public addInitialGameState(gameId: string, timer: number): Promise<void> {
        const query = new Query(
            "INSERT into gamestate (gameid, playerscount, drinkscount, gamestart, timer) VALUES ($1, 0, 0, NULL, $2)",
            [gameId, timer]
        );
        return this.client.execute(query);
    }

    public getGameState(gameId: string): Promise<string[]> {
        const query = new Query(
            "SELECT (playerscount, drinkscount, gamestart, timer) FROM gamestate WHERE gameid = $1",
            [gameId]
        );
        return this.client.execute(query);
    }

    public updateGameStart(gameId: string, gameStart: number): Promise<void> {
        const query = new Query(
            "UPDATE gamestate SET gamestart = $1 WHERE gameId = $2",
            [gameStart, gameId]
        );
        return this.client.execute(query);
    }
}