const { Telegraf } = require('telegraf');
const config = require('./config.json');
const { readdirSync } = require('fs');
const path = require('path');

const bot = new Telegraf('7763319426:AAGzss5DDUCPTQlMS0VLjpumtWA4b56lz0A'); 
const startCmd = `Welcome to the bot!\n\n`;

bot.start((ctx) => ctx.reply(startCmd));


const commands = {};
const commandFiles = readdirSync(path.join(__dirname, 'commands'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands[command.name] = command;
}

bot.on("message", async (ctx) => {
    const body = ctx.message.text || ctx.message.caption || "";
    let comm = body.trim().split(" ").shift().toLowerCase();
    let cmd = false;

    if (config.prefix && body.startsWith(config.prefix)) {
        cmd = true;
        comm = body.slice(config.prefix.length).trim().split(" ").shift().toLowerCase();
    }

    const command = comm;

    if (commands[command]) {
        commands[command].execute(ctx);
    } else {
        ctx.reply("Unknown command. Use /help to see available commands.");
    }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
