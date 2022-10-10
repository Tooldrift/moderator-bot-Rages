const { MessageEmbed } = require('discord.js');
const config = require("../../config.json");
const db = require('../../models/warndb');

module.exports = {
  name: "remove-warning",
  aliases: ['remove-w', 'rw'],
  category: "Administration",
  description: "Remove a user's warning(s).",
  usage: "remove-warning [user] [warning]",
  run: async (client, message, args) => {

    if (!message.member.permissions.has("ADMINISTRATOR")) return message.delete();

    if (!args[0]) {
      const embed = new MessageEmbed()
        .setDescription(`${config.emojis.wrong} Please mention the user.`)
        .setColor(config.messages.embeds.colors.no);

      return message.reply({ embeds: [embed] });
    }

    const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!user) {
      const embed = new MessageEmbed()
        .setDescription(`${config.emojis.wrong} Couldn't find that user on this server.`)
        .setColor(config.messages.embeds.colors.no);

      return message.reply({ embeds: [embed] });
    }

    db.findOne({
      guild: message.guild.id,
      user: user.user.id
    }, async (err, data) => {
      if (err) throw err;
      if (data) {
        if (!args[1]) {
          const embed = new MessageEmbed()
            .setDescription(`${config.emojis.wrong} Please provide the warn id/number from that user.`)
            .setColor(config.messages.embeds.colors.no);

          return message.reply({ embeds: [embed] });
        }
        let number = parseInt(args[1]) - 1;
        if (isNaN(number)) {
          const embed = new MessageEmbed()
            .setDescription(`${config.emojis.wrong} The warn id/number should be a number, not some text inputs.`)
            .setColor(config.messages.embeds.colors.no);

          return message.reply({ embeds: [embed] });
        }
        
        data.content.splice(number, 1)

        const embed = new MessageEmbed()
          .setDescription(`${config.emojis.success} Successfully **removed** warning \`${number}\` from ${user}.`)
          .setColor(config.messages.embeds.colors.yes);

        return message.reply({ embeds: [embed] });
        
        data.save();

      } else {
        const embed = new MessageEmbed()
          .setDescription(`${config.emojis.wrong} That user is currently have no warnings.`)
          .setColor(config.messages.embeds.colors.no);

        return message.reply({ embeds: [embed] });
      }
    })

  },
};