const fs = require('fs');
const { Input } = require("telegraf");

const axios = require('axios');
const snapsave = require("snapsave-downloader2");

module.exports = {
    name: "insta",
    async execute(ctx, body, getArgs) {
        const q = getArgs(ctx).join(" ")
        try {
            const igdl = await snapsave(q);
           ctx.sendVideo(Input.fromURLStream(igdl.data[0].url))
    
        } catch (error) {
            console.error(error);
        }
}
}
