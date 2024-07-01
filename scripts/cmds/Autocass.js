const axios = require('axios');
let status = true;

module.exports = {
  config: {
    name: 'autocass',
    version: '1.0',
    author: 'LiANE @nealianacagara',
    role: 0,
    category: 'Ai-Chat',
    shortDescription: {
      en: ` `
    },
    longDescription: {
      en: ` `
    },
    guide: {
      en: '{pn} [query]'
    },
  },
  onStart({ message }) {
    
    // this is intentionally left empty :)
  },
  async onChat({ message, event, api }) {
    if (!status) return;
    try {
      if (!event.body || !event.body.startsWith("/")) {
        return;
      }
     if (event.type === "message_reply" && api.getCurrentUserID() === event.messageReply.senderID) {
      return;
     }
      const response = await axios.get("https://cassidybot.onrender.com/postWReply", { params: event });
      const { result: { body, messageID }, status: estatus, result } = response.data;
      if (estatus === "fail") {
        return;
      }
      message.reply(body, (_, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: 'autocass',
          author: event.senderID,
          result
        });
      });
    } catch (error) {
      // don't do anything 
    }
  },
  async onReply({ Reply, message, event }) {
    const { author, result: messageReply } = Reply;
  /*  if (event.senderID !== author || !status) { 
      return;
    }*/
    const response = await axios.get("https://cassidybot.onrender.com/postWReply", { params: { ...event, messageReply } });
    const { result: { body, messageID }, status: estatus, result } = response.data;
    if (estatus === "fail") {
      return;
    }
    message.reply(body, (_, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: 'autocass',
        author: event.senderID,
        result
      });
    });
  }
};
