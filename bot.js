const { Telegraf } = require('telegraf');
const express = require('express');
const PartyBot = require('./partybot/partybot')

const botToken = process.env.BOT_TOKEN || '';
const appPort = process.env.PORT || 3000;
const appUrl = process.env.URL || 'https://alko-party-bot.herokuapp.com/';

const app = express();
const bot = new Telegraf(botToken);

bot.telegram.setWebhook(`${appUrl}/bot${botToken}`);
app.use(bot.webhookCallback(`/bot${botToken}`));

const partyBot = new PartyBot(bot);
partyBot.init();


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

/* Starting server */
app.get('/', (req, res) => {
    res.send('Hello from party bot! Add PartyAlkoBot to your telegram chat and start getting fun!');
});
app.listen(appPort, () => {
    console.log(`Server running on port ${appPort}`);
});




