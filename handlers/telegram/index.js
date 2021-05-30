const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'miqdaddevbot';

const {Firestore} = require('@google-cloud/firestore');

const NoteService = require('./note');
const SchedulerService = require('./scheduler');

const TelegramService = class {
  static init(bot) {
    const firestore = new Firestore();

    this.bot = bot;
    this.firestoreCollection = firestore.collection('gitgram');

    this.joined();
    this.getDate();
    this.addGithubOrganization();

    const noteService = new NoteService(bot, this.firestoreCollection);
    const schedulerService = new SchedulerService(bot, this.firestoreCollection);
  }

  static joined() {
    this.bot.on('new_chat_members', async (ctx) => {
      if (ctx.message.new_chat_member.username === BOT_USERNAME) {
        const chat_id = ctx.message.chat.id;

        const check = await this.firestoreCollection.doc(`CHAT_ID_${chat_id}`).get();
        // Check firestore document
        if (!check.exists) {

          // Add document to firestore
          await this.firestoreCollection.doc(`CHAT_ID_${chat_id}`)
            .set({
              name: ctx.message.chat.title,
              chat_id: ctx.message.chat.id,
              invited_by: ctx.message.from,
              github_organizations: [],
              notes: [],
              schedules: []
            });

          // Send reply message
          ctx.reply('Thank you for inviting me 👌');
        }
      }
    });
  }

  static getDate() {
    this.bot.command('/time', (ctx) => {
      ctx.reply(moment().format('YYYY-MM-DD HH:mm'));
    })
  }

  static addGithubOrganization() {
    this.bot.command('/github', async (ctx) => {
      const chat_id = ctx.message.chat.id;
      const organization_id = ctx.message.text.split(' ')[1];

      if (isNaN(organization_id)) return ctx.reply('Invalid Github organization ID, Github organization ID should be numeric');

      const chatDocument = this.firestoreCollection.doc(`CHAT_ID_${ctx.message.chat.id}`);
      const organizations = (await chatDocument.get()).data().github_organizations;
      organizations.push(organization_id);

      chatDocument.update({
        github_organizations: organizations
      });

      return ctx.reply('Github organization successfully added');
    })
  }
}

module.exports = TelegramService;