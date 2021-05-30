const {getEntityValues, getReplyMessage, sendReplyMessage} = require('../../utils/telegram_message');

const NoteService = class {
  constructor(bot, firestoreCollection) {
    this.bot = bot;
    this.firestoreCollection = firestoreCollection;
    this.listNote();
    this.addNote();
    this.deleteNote();
    this.getNote();
  }

  listNote(){
    this.bot.command('/notes', async (ctx) => {
      const chatDocument = this.firestoreCollection.doc(`CHAT_ID_${ctx.message.chat.id}`);
      const notes = (await chatDocument.get()).data().notes;

      let response = '';
      for (const note of notes) {
        response += `${note.tag}\n`;
      }

      ctx.reply(response);
    })
  }

  addNote() {
    this.bot.command('/note', async (ctx) => {
      const replyMessage = getReplyMessage(ctx.message);
      if (!replyMessage) return ctx.reply('Please reply a message to add note');

      // Get tag by entity
      const entityValues = getEntityValues(ctx.message, 'hashtag');
      if (!entityValues) return ctx.reply('Please add parameter #[tag_name]');
      const tag = entityValues[0];

      const chatDocument = this.firestoreCollection.doc(`CHAT_ID_${ctx.message.chat.id}`);
      const notes = (await chatDocument.get()).data().notes;

      const check = notes.find(note => note.tag === tag);
      if (check) return ctx.reply(`Tag ${tag} already used`);

      notes.push({
        tag: tag,
        type: replyMessage.type,
        value: replyMessage.value
      });

      chatDocument.update({
        notes: notes
      })

      return ctx.reply(`Note successfully added 👍`);
    })
  }

  deleteNote() {
    this.bot.command('/unnote', async (ctx) => {
      const entityValues = getEntityValues(ctx.message, 'hashtag');
      if (!entityValues) return ctx.reply('Please add parameter #[tag_name]');
      const tag = entityValues[0];

      const chatDocument = this.firestoreCollection.doc(`CHAT_ID_${ctx.message.chat.id}`);
      let notes = (await chatDocument.get()).data().notes;
      const check = notes.find(note => note.tag === tag);
      if(!check) return ctx.reply(`Note with tag ${tag} note found`);

      notes = notes.filter(note => note.tag !== tag);

      chatDocument.update({
        notes: notes
      });

      return ctx.reply(`Note successfully deleted`);
    })
  }

  getNote() {
    this.bot.hears(/^[#]+\w+$/, async (ctx) => {
      const tag = getEntityValues(ctx.message, 'hashtag')[0];
      const chatDocument = this.firestoreCollection.doc(`CHAT_ID_${ctx.message.chat.id}`);
      const note = (await chatDocument.get()).data().notes.find(note => note.tag === tag);
      if (note) {
        sendReplyMessage(ctx, note);
      }
    })
  }
}

module.exports = NoteService;