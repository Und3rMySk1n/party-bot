import * as express from 'express';
import { Telegraf } from 'telegraf';
import { PartyBot } from './party-bot/party-bot';
import {PlayerService} from "./players-service/player-service";
import {DbService} from "./db-service/db-service";
import { GameStateService } from './game-state-service/game-state-service';
import { DrinksService } from './drinks-service/drinks-service';
import { GameStatsService } from './game-stats-service/game-stats-service';

const token = process.env.BOT_TOKEN;
const port = process.env.PORT;
const appUrl = process.env.URL;

if (!token || !port || !appUrl) {
    throw Error('Environment not initialized');
}

const app = express();
const telegraf = new Telegraf(token);
const dbService = new DbService();
const playersService = new PlayerService(dbService);
const drinksService = new DrinksService(dbService);
const gameStateService = new GameStateService(dbService);
const gameStatsService = new GameStatsService(dbService, playersService, drinksService);

telegraf.telegram.setWebhook(`${appUrl}/bot${token}`);
app.use(telegraf.webhookCallback(`/bot${token}`));

const partyBot = new PartyBot(telegraf, playersService, drinksService, gameStateService, gameStatsService);

// Enable graceful stop
process.once('SIGINT', () => telegraf.stop('SIGINT'));
process.once('SIGTERM', () => telegraf.stop('SIGTERM'));

// Starting server
app.get('/', (req, res) => {
    res.send('Hello from party bot! Add Party Bot to your telegram chat and start getting fun!');
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});




