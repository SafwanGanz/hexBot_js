const { Telegraf } = require('telegraf');
const config = require('./config.json');
const { readdirSync } = require('fs');
const path = require('path');
const Canva = require('./lib/canvas')

const bot = new Telegraf(config.token);
const startCmd = `Welcome to the bot!\n\n`;

bot.start((ctx) => ctx.reply(startCmd));
bot.on("new_chat_members", async (ctx) => {
    const message = ctx.message;
    const groupname = message.chat.title;

    for (const newMember of message.new_chat_members) {
        try {
            const pp_user = await getPhotoProfile(newMember.id);
            const full_name = getUser(newMember).full_name;
            const generate = new Canva();

            generate.setName(full_name);
            generate.setGroupname(groupname);
            generate.setPpimg(pp_user);

            const buffer = await generate.welcome();

            console.log("├", "[  JOINS  ]", full_name, "joined", groupname);

            const button = [
                [{ text: 'Source Code!', url: "https://github.com/SafwanGanz" }]
            ];

            await ctx.replyWithPhoto(
                { source: buffer },
                {
                    caption: `Hai ${full_name}, welcome to ${groupname}!`,
                    reply_markup: { inline_keyboard: button }
                }
            );
        } catch (error) {
            console.error("Error processing new chat member:", error);
        }
    }
});



const commands = {};
const commandFiles = readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands[command.name] = command;
}

const getArgs = (ctx) => {
    try {
        const args = ctx.message.text.split(" ");
        args.shift();
        return args;
    } catch {
        return [];
    }
};

bot.on("message", async (ctx) => {
    const body = ctx.message.text || ctx.message.caption || "";
    const trimmedBody = body.trim();

    let commandName = trimmedBody.split(" ").shift().toLowerCase();

    if (config.prefix && trimmedBody.startsWith(config.prefix)) {
        commandName = trimmedBody.slice(config.prefix.length).trim().split(" ").shift().toLowerCase();
    }

    if (commands[commandName]) {
        await commands[commandName].execute(ctx, body, getArgs);
    } else {
      // await ctx.reply("Command not found");
    }

});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

function getUser(ctx) {
    try {
        var user = ctx;
        var last_name = user["last_name"] || "";
        var full_name = user.first_name + " " + last_name;
        user["full_name"] = full_name.trim();
        return user;
    } catch (e) {
        throw e;
    }
}

async function getBot(ctx) {
    try {
        var bot = ctx.botInfo;
        var last_name = bot["last_name"] || "";
        var full_name = bot.first_name + " " + last_name;
        bot["full_name"] = full_name.trim();
        return bot;
    } catch {
        return {};
    }
}

async function getLink(file_id) {
    try {
        return (await bot.telegram.getFileLink(file_id)).href;
    } catch {
        throw "Error while get url";
    }
}

async function getPhotoProfile(id) {
    try {
        var url_default =
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
        if (String(id).startsWith("-100")) {
            var pp = await bot.telegram.getChat(id);
            if (!pp.hasOwnProperty("photo")) return url_default;
            var file_id = pp.photo.big_file_id;
        } else {
            var pp = await bot.telegram.getUserProfilePhotos(id);
            if (pp.total_count == 0) return url_default;
            var file_id = pp.photos[0][2].file_id;
        }
        return await getLink(file_id);
    } catch (e) {
        throw e;
    }
}
