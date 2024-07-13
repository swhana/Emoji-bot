//Animated Webp를 Animated Gif로 변환해서 디스코드에 업로드해주는 봇입니다

const {
    Client,
    GatewayIntentBits,
    Partials,
    AttachmentBuilder,
} = require("discord.js");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { token } = require("./config.json");
const sharp = require("sharp");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return; //디스코드 봇이 올린 메시지에는 반응 안하도록
    if (message.attachments.size > 0) {
        const attachment = message.attachments.first();
        message.channel.send("file found!!");
        if (attachment.name.endsWith(".webp")) {
            message.channel.send("webp found!!");
            try {
                // WebP 파일 다운로드
                const webpPath = path.join(
                    __dirname,
                    `temp_${attachment.name}`
                );

                const gifPath = webpPath.replace(".webp", ".gif");
                const response = await axios.get(attachment.url, {
                    responseType: "arraybuffer",
                });
                await fs.writeFileSync(webpPath, response.data); //webpPath로 webp 임시파일 저장

                //Sharp 라이브러리를 활용해 Animated Webp -> Animated gif로 변환
                await sharp(webpPath, {
                    animated: true,
                    limitInputPixels: 0,
                })
                    .resize({ width: 512 })
                    .toFile(gifPath);

                //변환된 Animated Gif를 봇이 재업로드
                const gifAttachment = new AttachmentBuilder(gifPath);
                await message.channel.send({
                    files: [gifAttachment],
                });

                //sharp cache에 남아있는 webp 파일 제거
                sharp.cache(false);

                //임시파일 제거(Cache 삭제를 해줘야만 정상작동함)
                fs.unlinkSync(gifPath);
                fs.unlinkSync(webpPath);
            } catch (error) {
                console.error("Error processing the file:", error);
            }
        } else {
            message.channel.send("WebP 파일을 올려주세요");
        }
    }
});

client.login(token);
