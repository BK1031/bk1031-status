const botconfig = require("./botconfig.json");
const monitors = require("./monitor.json")
const Discord = require("discord.js");
const fs = require('fs');
const express = require('express')
const nodemailer = require("nodemailer");
const got = require('got');
var cron = require('node-cron');

const app = express()
const port = 3000

const client = new Discord.Client();
client.commands = new Discord.Collection();

app.use(express.static('web'))

app.listen(port, () => console.log(`Server listening at http://localhost:${port}`))

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); 

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: botconfig.email,
    pass: botconfig.pw
  }
});

client.login(botconfig.token);

client.on("ready", () => {
  console.log(`${client.user.username} is online!`);
  client.channels.cache.get('692986198112600094').send(new Discord.MessageEmbed()
    .setAuthor('BK1031 Status', null, 'https://status.bk1031.dev')
    .setColor('#2db1ff')
    .setDescription(`Status monitoring is online!`)
  );
});

client.on("message", (message) => {
  if (!message.content.startsWith(botconfig.dev_prefix + botconfig.prefix) || message.author.bot) return;
  // Parse user input
  const args = message.content.slice((botconfig.dev_prefix + botconfig.prefix).length).split(/ +/);
  const command = args.shift().toLowerCase();
  // Check if command exists
  if (!client.commands.has(command)) {
      console.log(`Command ${command} does not exist`);
      return;
  };
  client.commands.get(command).execute(message, args);
  if (botconfig.dev_prefix != "") {
      message.channel.send(new Discord.MessageEmbed().setFooter('NOTE: This is a Dev Command. Some things may be broken.'));
  }
});

cron.schedule('*/5 * * * *', () => {
  console.log('running status task 5 minutes');
  client.channels.cache.get('692986198112600094').send(new Discord.MessageEmbed()
    .setAuthor("Running status update")
    .setTimestamp()
  );
  monitors.forEach((monitor) => {
    (async () => {
      try {
        const response = await got(monitor.url)
        console.log("Checking " + monitor.name);
        if (response.statusCode == 200) {
          client.channels.cache.get('692986198112600094').send(new Discord.MessageEmbed()
            .setAuthor(monitor.name, null, monitor.url)
            .setDescription("ONLINE")
            .setColor('#36ff79')
          );
          const mailOptions = {
            to: monitor.email + ',' + botconfig.email,
            replyTo: monitor.email,
            subject: 'UP - ' + Date.now(),
            text: 'Service is UP, msg sent from BK1031 Status Bot'
          };
          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              client.channels.cache.get('692986198112600094').send('Email sent: ' + info.response);
            }
          });
        }
        else {
          client.channels.cache.get('692986198112600094').send(new Discord.MessageEmbed()
            .setAuthor(monitor.name, null, monitor.url)
            .setDescription("OFFLINE")
            .setColor('#ff3636')
          );
          const mailOptions = {
            to: monitor.email + ',' + botconfig.email,
            replyTo: monitor.email,
            subject: 'DOWN - ' + Date.now(),
            text: 'Service is DOWN, msg sent from BK1031 Status Bot'
          };
          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              client.channels.cache.get('692986198112600094').send('Email sent: ' + info.response);
            }
          });
        }
      } catch (error) {
        client.channels.cache.get('692986198112600094').send(new Discord.MessageEmbed()
          .setAuthor(monitor.name, null, monitor.url)
          .setDescription("OFFLINE")
          .setColor('#ff3636')
        );
        const mailOptions = {
          to: monitor.email + ',' + botconfig.email,
          replyTo: monitor.email,
          subject: 'DOWN - ' + Date.now(),
          text: 'Service is DOWN, msg sent from BK1031 Status Bot'
        };
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
            client.channels.cache.get('692986198112600094').send('Email sent: ' + info.response);
          }
        });
      }
    })();
  });
});