const yts = require("yt-search");
const ytdl = require("ytdl-core");
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);

module.exports = {
    name: "ytmp3",
    async execute(ctx) {
        const getArgs = (ctx) => {
            return ctx.message.text.split(" ").slice(1);
        }
        const downloadMp3 = async (url) => {
            const audioStream = ytdl(url, {
                filter: 'audioonly',
                quality: 'highestaudio'
            });
            const buffer = await stream2buffer(audioStream);
            return buffer;
        };

        const stream2buffer = async (audioStream) => {
            const chunks = [];
            for await (const chunk of audioStream) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        };

        try {
            const q = getArgs(ctx).join(" ");
            if (!q) {
                return ctx.reply("Please provide a search query.");
            }

            const result = await yts(q);
            if (!result || !result.videos.length) {
                return ctx.reply("No results found for the given query.");
            }
            const videoUrl = result.videos[0].url;
            const buffer = await downloadMp3(videoUrl);
            ctx.sendReplyWithAudio(buffer, 'audio.mp3');
        } catch (err) {
            console.error(err);
            ctx.reply("An error occurred while processing your request.");
        }
    },
};
