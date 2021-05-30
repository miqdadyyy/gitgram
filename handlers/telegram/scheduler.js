const {getEntityValues, getReplyMessage, sendScheduleMessage} = require('../../utils/telegram_message');
const CronJobManager = require('cron-job-manager');
const CronConverter = require('cronstrue');
const {isCronValid} = require('../../utils/string')

const SchedulerService = class {
  constructor(bot, firestoreCollection) {
    this.bot = bot;
    this.firestoreCollection = firestoreCollection;

    this.cronJobManager = new CronJobManager();

    this.bootSchedules();
    this.listSchedule();
    this.addSchedule();
    this.deleteSchedule();
    this.listJobs();
  }

  async bootSchedules() {
    const docs = await this.firestoreCollection.get();
    docs.forEach(doc => {
      const data = doc.data();
      for (const schedule of data.schedules ?? []) {
        this.runSchedule(data.chat_id, schedule);
      }
    })
  }

  runSchedule(chatId, schedule) {
    this.cronJobManager.add(schedule.key, schedule.time, () => {
      sendScheduleMessage(this.bot.telegram, chatId, schedule);
    }, {
      start: true,
      timeZone: 'Asia/Jakarta'
    })
  }

  listJobs() {
    this.bot.command('/jobs', (ctx) => {
      let response = JSON.stringify(this.cronJobManager.listCrons());
      ctx.reply(response);
    })
  }

  listSchedule() {
    this.bot.command('/schedules', async (ctx) => {
      const chatDocument = this.firestoreCollection.doc(`CHAT_ID_${ctx.message.chat.id}`);
      const schedules = (await chatDocument.get()).data().schedules;

      if (schedules.length === 0) return ctx.reply('No schedules found');

      let response = '';
      for (const schedule of schedules) {
        response += `${schedule.key} => ${CronConverter.toString(schedule.time)} (${schedule.time})\n`;
      }

      return ctx.reply(response);
    })
  }

  addSchedule() {
    this.bot.command('/schedule', async (ctx) => {
      const replyMessage = getReplyMessage(ctx.message);
      if (!replyMessage) return ctx.reply('Please reply a message to add schedule');


      const message = ctx.message.text.split(' ');
      const key = message[1];
      const scheduleTime = message.slice(2).join(' ');

      if (!isCronValid(scheduleTime)) return ctx.reply('Invalid schedule format');

      const chatDocument = this.firestoreCollection.doc(`CHAT_ID_${ctx.message.chat.id}`);
      const schedules = (await chatDocument.get()).data().schedules;

      const check = schedules.find(schedule => schedule.key === key);
      if (check) return ctx.reply(`Schedule with id ${id} already used`);

      const schedule = {
        key: key,
        time: scheduleTime,
        type: replyMessage.type,
        value: replyMessage.value
      };

      this.runSchedule(ctx.message.chat.id, schedule);
      schedules.push(schedule);

      chatDocument.update({
        schedules: schedules
      })

      return ctx.reply(`Schedule ${key} successfully created on ${CronConverter.toString(scheduleTime)}👍`);
    })
  }

  deleteSchedule() {
    this.bot.command('/unschedule', async (ctx) => {
      const message = ctx.message.text.split(' ');
      const key = message[1];

      if(!key) return ctx.reply(`Please add argument [key_name]`);

      const chatDocument = this.firestoreCollection.doc(`CHAT_ID_${ctx.message.chat.id}`);
      let schedules = (await chatDocument.get()).data().schedules;
      const check = schedules.find(schedule => schedule.key === key);
      if (!check) return ctx.reply(`Schedule with key ${key} not found`);

      schedules = schedules.filter(schedule => schedule.key !== key);

      chatDocument.update({
        schedules: schedules
      });

      this.cronJobManager.deleteJob(key);

      return ctx.reply(`Schedule successfully deleted`);
    })
  }
}

module.exports = SchedulerService;