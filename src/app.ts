import * as express from 'express';
import { Telegraf } from 'telegraf';
import { PartyBot } from './party-bot/party-bot';
import {PlayerService} from "./party-bot/services/players-service/player-service";
import {DbService} from "./party-bot/services/db-service/db-service";
import { GameStateService } from './party-bot/services/game-state-service/game-state-service';
import { DrinksService } from './party-bot/services/drinks-service/drinks-service';
import { GameStatisticsService } from './party-bot/services/game-statistics-service/game-statistics-service';

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
const gameStatisticsService = new GameStatisticsService(dbService);

telegraf.telegram.setWebhook(`${appUrl}/bot${token}`);
app.use(telegraf.webhookCallback(`/bot${token}`));

const partyBot = new PartyBot(telegraf, playersService, drinksService, gameStateService, gameStatisticsService);

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




