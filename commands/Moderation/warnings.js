const { MessageEmbed } = require("discord.js");
const warndb = require('../../models/warndb');
const config = require("../../config.json");

module.exports = {
  name: "warnings",
  aliases: ['warns'],
  category: "Moderation",
  description: "Check a user's warnings.",
  usage: "warnings [user]",
  run: async (client, message, args) => {

    const user = message.mentions.members.first() || message.member;

    warndb.findOne({
      guild: message.guild.id,
      user: user.id
    }, async (err, data) => {
      if (err) throw err

      if (data) {
        const e = data.content.map(
          (w, i) => `\n\`Warn #${i + 1}\` | **Moderator:** ${message.guild.members.cache.get(w.moderator).user.tag} (\`${message.guild.members.cache.get(w.moderator).user.id}\`)\n> __Reason:__ ${w.reason}\n`
        )
        const embed = new MessageEmbed()
          .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
          .setDescription(`• __All the warnings from the user__ <@${user.user.id}>:\n` + `${e ? e.join(' ') : "No Warns."}`)
          .setFooter("If there is no warnings above, means that user does not have any warnings!")
          .setTimestamp();
        message.reply({
          embeds: [embed]
        })

      } else {

        const noWarns = new MessageEmbed()
          .setDescription(`${config.emojis.success} That user does not have any warnings.`)
          .setColor(config.messages.embeds.colors.yes);

        message.reply({ embeds: [noWarns] });
      }
    })

  },
};