const axios = require('axios');

const bannedUsers = new Set();
const bannedCookies = new Set();

function isBanned(userID) {
  return bannedUsers.has(userID);
}

function banUser(userID) {
  bannedUsers.add(userID);
}

function isBannedCookie(cookie) {
  return bannedCookies.has(cookie);
}

function banCookie(cookie) {
  bannedCookies.add(cookie);
}

module.exports = {
  config: {
    name: "bing",
    aliases: ["b"],
    version: "1.3", 
    author: "ArYAN X UPoL 🐔",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: 'Converts text to image'
    },
    longDescription: {
      en: "Generates images based on provided text using Bing API."
    },
    category: "image",
    guide: {
      en: '{pn} your prompt'
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { senderID, userID, cookie, isAdmin } = event;
    const text = args.join(" ");
    if (!text) {
      return message.reply("❓ Please provide a prompt.");
    }

    let prompt = text;

    let cookies = cookie || ""; // Replace 'your_cookies_here' with the actual cookies value



    // Check if sender is banned
    if (isBanned(senderID)) {
      return api.sendMessage("❌ You are banned from using this command.", event.threadID);
    }

    // Check if user is banned
    if (userID && isBanned(userID)) {
      return api.sendMessage("❌ You are banned from using this command.", event.threadID);
    }

    // Check if cookie is banned
    if (isBannedCookie(cookies)) {
      return api.sendMessage("❌ Your cookies are banned from using this command.", event.threadID);
    }

    // If user is admin, check for ban command
    if (isAdmin && args[0] === 'ban' && args[2]) {
      const bannedUserID = args[1];
      banUser(bannedUserID); // Ban the user
      return api.sendMessage(`✅ User ID ${bannedUserID} has been banned from using this command.`, event.threadID);
    }

    message.reply(`✅ Creating your image...`, async (err, info) => {
      let ui = info.messageID;
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      try {
        const response = await axios.get(`https://upol-dev-api.onrender.com/api/bing?prompt=${prompt}&cookies=${cookies}`);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        const images = response.data.url;
        if (!images) {
          throw new Error("Images data is missing in the response");
        }
        message.unsend(ui);
        message.reply({
          body: `🖼 [𝗕𝗜𝗡𝗚] \n━━━━━━━━━━━━\n\nPlease reply with the image number (1, 2, 3, 4) to get the corresponding image in high resolution.`,
          attachment: await Promise.all(images.map(img => global.utils.getStreamFromURL(img)))
        }, async (err, info) => {
          if (err) return console.error(err);
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            imageUrls: images
          });
        });
      } catch (error) {
        console.error(error);
        api.sendMessage(`❌ Error: ${error.message}`, event.threadID);
      }
    });
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const { author, imageUrls } = Reply;
    if (event.senderID !== author) return;
    try {
      const reply = parseInt(args[0]);
      if (reply >= 1 && reply <= 4) {
        const img = imageUrls[reply - 1];
        message.reply({ attachment: await global.utils.getStreamFromURL(img) });
      } else {
        message.reply("❌ Invalid image number. Please reply with a number between 1 and 4.");
      }
    } catch (error) {
      console.error(error);
      api.sendMessage(`❌ Error: ${error.message}`, event.threadID);
    }
    message.unsend(Reply.messageID); 
  },
};
