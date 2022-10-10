const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const config = require("../../config.json");
const ms = require('ms');

module.exports = {
  name: "mute",
  aliases: ['m'],
  category: "Moderation",
  description: "Mute a user with a specific duration, using the timeout feature.",
  usage: "mute [user] [time] (reason)",
  run: async (client, message, args) => {

    if (!message.member.permissions.has("DEAFEN_MEMBERS")) return message.delete().catch(() => { });

    if (!args[0]) {
      const embed = new MessageEmbed()
        .setDescription(`${config.emojis.wrong} Please mention the user.`)
        .setColor(config.messages.embeds.colors.no);
      return message.reply({ embeds: [embed] })
    }

    const user = message.mentions.users.first() || message.guild.members.cache.find(r => r.user.id === args[0]);

    if (!user) {
      const embed = new MessageEmbed()
        .setDescription(`${config.emojis.wrong} Couldn't find that user on this server.`)
        .setColor(config.messages.embeds.colors.no);
      return message.reply({ embeds: [embed] })
    }

    const time = args[1];

    if (!time) {
      const embed = new MessageEmbed()
        .setDescription(`${config.emojis.wrong} Please provide the time to mute the user. Use the suffixes **s**, **m**, **h** or, **d** for the duration.`)
        .setColor(config.messages.embeds.colors.no);
      return message.reply({ embeds: [embed] })
    }

    const reason = args.slice(2).join(' ');

    const milliseconds = ms(time);

    if (!milliseconds || milliseconds < 10000 || milliseconds > 2419200000) {
      const embed = new MessageEmbed()
        .setDescription(`${config.emojis.wrong} The duration should be between **10s** and **28d**.`)
        .setColor(config.messages.embeds.colors.no);
      return message.reply({ embeds: [embed] })
    }

    const iosTime = new Date(Date.now() + milliseconds).toISOString();

    await fetch(`https://discord.com/api/guilds/${message.guild.id}/members/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ communication_disabled_until: iosTime }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${client.token}`,
      },
    });

    const embed = new MessageEmbed()
      .setDescription(`${config.emojis.success} ${user} (\`${user.id}\`) has been **muted**.`)
      .setColor(config.messages.embeds.colors.yes);

    message.delete().catch(() => { });

    message.channel.send({ embeds: [embed] });

    const embedDM = new MessageEmbed()
      .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() })
      .setTitle(`You've been muted on ${message.guild.name}.`)
      .addFields(
        { name: "• Duration:", value: `\`${time}\`` },
        { name: "• Reason:", value: `${reason || "[No reason provided]"}` },
      )
      .setColor("YELLOW")
      .setFooter(`User ID: ${user.id}`)
      .setTimestamp();

    user.send({ embeds: [embedDM] }).catch(e => { });

  },
};