module.exports = {
    name: "echo",
    execute(ctx) {
        ctx.reply(ctx.message.text);
    },
};