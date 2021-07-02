const { Telegraf } = require('telegraf');
const express = require('express');
const PartyBot = require('./partybot/partybot')

const token = process.env.BOT_TOKEN || '';
const port = process.env.PORT || 3000;
const appUrl = process.env.URL || 'https://alko-party-bot.herokuapp.com/';

const app = express();
const telegraf = new Telegraf(token);

telegraf.telegram.setWebhook(`${appUrl}/bot${token}`);
app.use(telegraf.webhookCallback(`/bot${token}`));

const partyBot = new PartyBot(telegraf);
partyBot.init();

// Enable graceful stop
process.once('SIGINT', () => telegraf.stop('SIGINT'));
process.once('SIGTERM', () => telegraf.stop('SIGTERM'));

/* Starting server */
app.get('/', (req, res) => {
    res.send('Hello from party bot! Add PartyAlkoBot to your telegram chat and start getting fun!');
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});




