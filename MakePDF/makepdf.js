require('dotenv').config()
const Discord = require('discord.js');
const https = require('https');
const libre = require('libreoffice-convert');

// Create an instance of a Discord client
const client = new Discord.Client();

// Bot will be able to send & receive to Discord only after this
client.on("ready", () => {
    console.log('MakePDF bot started & ready to answer !');
    client.user.setActivity(`${client.guilds.cache.size} servers ⚡`, { type: 'WATCHING' });
});

client.on("guildCreate", guild => {
    client.user.setActivity(`${client.guilds.cache.size} servers ⚡`, { type: 'WATCHING' });
});

client.on("guildDelete", guild => {
    client.user.setActivity(`${client.guilds.cache.size} servers ⚡`, { type: 'WATCHING' });
});

// On message received
client.on('message', async msg => {

    try {

        if (msg.author.id == client.user.id) return

        const Attachment = (msg.attachments).array();

        if (Attachment === undefined || Attachment === null) return;

        Attachment.forEach((attachment) => {

            if (attachment === undefined || attachment === null) return;

            const fileName = attachment.name;

            const formats = process.env.FORMATS.split(',');
            const extension = fileName.substring(fileName.lastIndexOf(".") + 1);

            if (formats.includes(extension)) {

                https.get(attachment.url, res => {

                    const bufs = [];

                    res.on('data', function (chunk) {
                        bufs.push(chunk)
                    });

                    res.on('error', function (err) {
                        console.log(`Error during HTTP request : ${err.message}`);
                    });

                    res.on('end', function () {

                        const fileData = Buffer.concat(bufs);

                        libre.convert(fileData, ".pdf", undefined, (err, pdfData) => {

                            if (err) {
                                msg.channel.send(`Sorry, the conversion has failed :(`);
                                console.log(`Error converting file : ${err}`);
                            }

                            const newName = fileName.substring(0, fileName.lastIndexOf(".")) + ".pdf";
                            const newAttachment = new Discord.MessageAttachment(pdfData, newName);
                            msg.channel.send(`Here is your converted PDF file !`, newAttachment);

                        });

                    });

                });

            }

        });

    } catch (ex) {

        console.log(`Error : ${ex}`);

    }

});

client.login(process.env.TOKEN);