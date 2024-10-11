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

  // 이모지 추출 로직
  const customEmojiRegex = /<a?:\w+:\d+>/g;
  const emojiMatch = message.content.match(customEmojiRegex);
  if (!emojiMatch) return;
  const emojiURLs = emojiMatch.map((emoji) => {
    const emojiId = emoji.split(":")[2].replace(">", "");
    const extension = emoji.startsWith("<a:") ? ".gif" : ".png";
    return `https://cdn.discordapp.com/emojis/${emojiId}${extension}`;
  });

  if (emojiURLs.length > 1) return;
  const userId = message.author.id;
  const avatarId = message.author.avatar;
  const avatarURL = `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.webp`;

  // 새 메시지용 유저 데이터
  const username = message.member
    ? message.member.displayName
    : message.author.username;
  const avatar_url = message.member.avatarURL() ?? avatarURL;

  // 채널 세션에 저장되어 있는 Webhook 가져오기(이모지를 사용했던 유저별로 저장됨)
  const webhooks = await message.channel.fetchWebhooks();

  let hook = webhooks
    .filter((user) => user.name === message.author.username)
    .first();

  // 유저의 webhook이 없을 경우 새로 생성
  if (hook === undefined) {
    hook = await message.channel.createWebhook({
      name: message.author.username,
      avatar: message.member.avatarURL() ?? avatarURL,
    });
  }

  // 원본 메시지 삭제 (봇에게 '메시지 관리' 권한 필요)
  message.delete();

  hook.send({
    username: username,
    avatarURL: avatar_url,
    content: emojiURLs[0],
  });
});

client.login(token);
