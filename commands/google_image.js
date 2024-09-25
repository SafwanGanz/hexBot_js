let _gis = require("g-i-s");
let axios = require("axios");
let { promisify } = require("util");
const { Input } = require("telegraf");
let gis = promisify(_gis);

module.exports = {
    name: "img",
    async execute(ctx) {
        const getArgs = (ctx) => {
            return ctx.message.text.split(" ").slice(1);
        };

        const q = getArgs(ctx).join(" ");
        if (!q) {
            return ctx.reply("Please provide a search query.");
        } else {
            try {
                let results = await gis(q);
                if (!results || results.length === 0) {
                    return ctx.reply("No images found.");
                }
                let { url, width, height } = pickRandom(results) || {};
                if (!url) return ctx.reply("No valid image URL found.");
                let link_d = (await axios.get(`https://tinyurl.com/api-create.php?url=${url}`)).data;
                ctx.sendPhoto(Input.fromURLStream(url));
            } catch (e) {
                console.error(e);
                ctx.reply("An error occurred while searching for the image.");
            }
        }
    }
};

// Function to pick a random element from an array
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
