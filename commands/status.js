const Discord = require('discord.js');
const got = require('got');
const monitors = require('../monitor.json')

module.exports = {
	name: 'status',
    description: 'Get status info',
    dev: false,
	execute(message, args) {
        monitors.forEach((monitor) => {
            (async () => {
                try {
                    const response = await got(monitor.url)
                    console.log("Checking " + monitor.name);
                    if (response.statusCode == 200) {
                        console.log("pog")
                        message.channel.send(new Discord.MessageEmbed()
                            .setAuthor(monitor.name, null, monitor.url)
                            .setDescription("ONLINE")
                            .setColor('#36ff79')
                        );
                    }
                    else {
                        console.log("not pog")
                        message.channel.send(new Discord.MessageEmbed()
                            .setAuthor(monitor.name, null, monitor.url)
                            .setDescription("OFFLINE")
                            .setColor('#ff3636')
                        );
                    }
                } catch (error) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setAuthor(monitor.name, null, monitor.url)
                        .setDescription("OFFLINE")
                        .setColor('#ff3636')
                    );
                }
            })();
        });
	},
};