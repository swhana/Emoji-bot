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
    const emoji = message.guild.emojis.cache.get(emojiId);

    if (emoji) {
      // 이모지 이미지 URL 가져오기
      const emojiURL = `https://cdn.discordapp.com/emojis/${emojiId}.png`;

      // 원본 메시지 삭제 (봇에게 '메시지 관리' 권한 필요)
      message.delete();

      // 웹훅 생성 및 메시지 전송 예제
      const webhook = await message.channel.createWebhook({
        name: message.author.username,
        avatar: message.author.displayAvatarURL(),
      });

      await webhook.send({
        username: message.member
          ? message.member.displayName
          : message.author.username,
        avatarURL: message.author.displayAvatarURL({ dynamic: true }),
        content: emojiURL,
      });

      // 웹훅 삭제 (웹훅 남용 방지)
      webhook.delete();
    }
  }
});

client.login(token);
