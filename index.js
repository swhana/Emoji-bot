//Animated Webp를 Animated Gif로 변환해서 디스코드에 업로드해주는 봇입니다

const { Client, GatewayIntentBits, Partials } = require("discord.js");

const { token } = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

//Emoji
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // 이모지 추출 로직 구현
  const customEmojiRegex = /<a?:\w+:\d+>/g;
  const emojiMatch = message.content.match(customEmojiRegex);

  if (emojiMatch) {
    const emojiId = emojiMatch[0].split(":")[2].replace(">", "");
    const userId = message.author.id;
    const avatarId = message.author.avatar;
    let extension = ".png";
    if (message.content.includes("<a:")) extension = ".gif";

    // 이모지 이미지 URL 가져오기
    const emojiURL = `https://cdn.discordapp.com/emojis/${emojiId}${extension}`;
    const avatarURL = `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.webp`;

    // 원본 메시지 삭제 (봇에게 '메시지 관리' 권한 필요)
    await message.delete();

    // 채널 세션에 저장되어 있는 Webhook 가져오기(이모지를 사용했던 유저별로 저장됨)
    const webhooks = await message.channel.fetchWebhooks();

    const hook = webhooks
      .filter((user) => user.name === message.author.username)
      .first();

    if (hook === undefined) {
      const webhook = await message.channel.createWebhook({
        name: message.author.username,
        avatar: message.member.avatarURL() ?? avatarURL,
      });
      await webhook.send({
        username: message.member
          ? message.member.displayName
          : message.author.username,
        avatarURL: message.member.avatarURL() ?? avatarURL,
        content: emojiURL,
      });
    } else {
      await hook.send({
        username: message.member
          ? message.member.displayName
          : message.author.username,
        avatarURL: message.member.avatarURL() ?? avatarURL,
        content: emojiURL,
      });
    }
  }
});

client.login(token);
