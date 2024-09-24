module.exports = {
    name: "help",
    execute(ctx) {
        let help = "Available commands:\n\n"
        help += "/help - Show this message\n"
        help += "/start - Start the bot\n"
        help += "/echo - Echo your message\n"
        help += "/ping - Pong!"
        ctx.reply(help);
    },
};
