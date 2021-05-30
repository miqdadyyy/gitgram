const {Message} = require('typegram');

/**
 * @param {Message} message
 * @param type
 * @return {array}
 */
function getEntities(message, type = null) {
  let entities = [];
  if (message.caption_entities) entities = message.caption_entities;
  if (message.entities) entities = message.entities;

  if (type) {
    return entities.filter(entity => entity.type === type);
  }

  return entities;
}

/**
 * @param {Message} message
 * @param type
 * @return {array}
 */
function getEntityValues(message, type = null) {
  console.log(message);
  const entities = getEntities(message, type);
  const result = [];
  for (const entity of entities) {
    result.push(message.text.slice(entity.offset, entity.offset + entity.length))
  }
  return result;
}

/**
 *
 * @param {Message} message
 * @return {object}
 */
function getReplyMessage(message) {
  if (!message.reply_to_message) return undefined;

  let type, value;

  if (message.reply_to_message.video) {
    type = 'video';
    value = message.reply_to_message.video.file_id;
  } else if (message.reply_to_message.sticker) {
    type = 'sticker';
    value = message.reply_to_message.sticker.file_id;
  } else if (message.reply_to_message.photo) {
    type = 'photo';
    value = message.reply_to_message.photo[message.reply_to_message.photo.length - 1].file_id;
  } else {
    type = 'text';
    value = message.reply_to_message.text;
  }

  return {
    type,
    value
  }
}

/**
 *
 * @param ctx
 * @param replyMessage
 */
function sendReplyMessage(ctx, replyMessage) {
  sendBotMessage(ctx.tg, ctx.message.chat.id, replyMessage.type, replyMessage.message);
}

function sendScheduleMessage(bot, chatId, schedule) {
  sendBotMessage(bot, chatId, schedule.type, schedule.value);
}

function sendBotMessage(bot, chatId, type, message) {
  if (type === 'video') bot.sendVideo(chatId, message);
  if (type === 'sticker') bot.sendSticker(chatId, message);
  if (type === 'photo') bot.sendPhoto(chatId, message);
  if (type === 'text') bot.sendMessage(chatId, message);
}

module.exports = {
  getEntities,
  getEntityValues,
  getReplyMessage,
  sendReplyMessage,
  sendScheduleMessage
}