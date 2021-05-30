const {Telegraf} = require('telegraf');
const TelegramService = require('./handlers/telegram');
const GithubService = require('./handlers/github');
const telegramBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN');
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app, {getRouter}) => {
  TelegramService.init(telegramBot);
  GithubService.init(app, telegramBot);
  const webhookRouter = getRouter("/_webhook");
  webhookRouter.use(require("express").static("public"));
  webhookRouter.use(telegramBot.webhookCallback('/telegram'));

  app.log.info("Yay, the app was loaded!");
};
