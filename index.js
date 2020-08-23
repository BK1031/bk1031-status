const botconfig = require("./botconfig.json");
const monitors = require("./monitor.json")
const Discord = require("discord.js");
const fs = require('fs');
const express = require('express')
const nodemailer = require("nodemailer");
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

client.login(botconfig.token);

client.on("ready", () => {
    console.log(`${client.user.username} is online!`);
    client.channels.cache.get('692986198112600094').send(new Discord.MessageEmbed()
        .setAuthor('BK1031 Status')
        .setColor('#2db1ff')
        .setDescription(`Status monitoring is online!`)
    );
});

cron.schedule('*/1 * * * *', () => {
    console.log('running a task 5 minutes');
  });
  

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: botconfig.email,
      pass: botconfig.pw
    }
  });
  
  const mailOptions = {
    to: 'bharat1031@gmail.com',
    subject: 'Invoices due',
    text: 'Dudes, we really need your money.'
  };
  
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });