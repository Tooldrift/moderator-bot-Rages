const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const { readdirSync } = require("fs");
const wait = require('node:timers/promises').setTimeout;
const config = require("../../config.json");

module.exports = {
  name: "help",
  aliases: ['h'],
  category: "Information",
  description: "Shows a list of commands and their categories in one dropdown menu.",
  usage: "help (command)",
  run: async (client, message, args) => {

    if (!args[0]) {

      const embed = new MessageEmbed()
        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
        .setTitle(client.user.username + " - Help Menu:")
        .setDescription(`Welcome to **${client.user.username}'s service!** To check my commands, __select one of the command categories in the dropdown menu below.__`)
        .addFields(
          {
            name: "• ❓ __How to use me?__",
            value: `\`○\` To execute a command, type: \`${config.prefix}[command]\`.\n\`○\` To get a command's aliases, description or usage, use: \`${config.prefix}help [command]\`.\n\`○\` Slash commands are available, Try now: \`/help\`.`,
            inline: true
          },
          {
            name: "• 📈 __Commands Counter:__",
            value: `\`○\` Prefix Commands: ${client.commands.size}\n\`○\` Slash Commands: ${client.slashCommands.size}\n\`○\` Total: ${client.slashCommands.size + client.commands.size}`,
            inline: true
          },
        )
        .setFooter(`Officially developed by: ${config.users.owner_tag}`)
        .setTimestamp()
        .setColor("BLUE");

      const emojis = {
        Administration: "🛡️",
        Developer: "927672868270145577",
        Fun: "😂",
        General: "🏠",
        Giveaway: "🎉",
        Image: "🖼️",
        Information: "ℹ️",
        Moderation: "⚒️",
        Owner: "👑",
        Ranking: "📊",
        Setup: "⬆️",
        Utility: "⚙️"
      };

      const rowButtonsHomeDisabled = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('help_menu_button_home')
            .setEmoji('🏠')
            .setDisabled(true)
            .setLabel('Home page')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setURL(config.systems.commands.help.buttons.invite || "https://discord.com/channels/@me")
            .setEmoji('951665482400931930')
            .setDisabled(true) // BECAUSE T.F.A's TOOLS BOT IS PRIVATE. If your bot is public, change "true" to "false".
            .setLabel('Invite me!')
            .setStyle('LINK'),
          new MessageButton()
            .setURL(config.systems.commands.help.buttons.support_server || "https://discord.com/channels/@me")
            .setEmoji('951665482996518914')
            .setLabel('Join support server!')
            .setStyle('LINK'),
        );

      const rowButtons = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('help_menu_button_home')
            .setEmoji('🏠')
            .setLabel('Home page')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setURL(config.systems.commands.help.buttons.invite || "https://discord.com/channels/@me")
            .setEmoji('951665482400931930')
            .setDisabled(true) // BECAUSE T.F.A's TOOLS BOT IS PRIVATE. If your bot is public, change "true" to "false".
            .setLabel('Invite me!')
            .setStyle('LINK'),
          new MessageButton()
            .setURL(config.systems.commands.help.buttons.support_server || "https://discord.com/channels/@me")
            .setEmoji('951665482996518914')
            .setLabel('Join support server!')
            .setStyle('LINK'),
        );

      const rowMenu = new MessageActionRow()
        .addComponents([
          new MessageSelectMenu()
            .setCustomId("help-menu")
            .setPlaceholder("Click here to select a category!")
            .addOptions([
              client.categories.map((cat) => {
                return {
                  label: `${cat[0].toUpperCase() + cat.slice(1)}`,
                  value: cat,
                  emoji: emojis[cat] || "❔",
                  description: `Click here to see ${cat}'s commands.`
                }
              })
            ])
        ]);

      const rowMenuDisabled = new MessageActionRow()
        .addComponents([
          new MessageSelectMenu()
            .setCustomId("help-menu-disabled")
            .setPlaceholder("Expired! Timed out after 3 minutes.")
            .setDisabled(true)
            .addOptions({
              label: `ERR`,
              value: "ERR",
              description: `ERR`
            })
        ]);

      message.reply({ embeds: [embed], components: [rowMenu, rowButtonsHomeDisabled] }).then(async (msg) => {

        // Buttons collector:
        let filterButtons = (i) => i.user.id === message.member.id;
        const collectorButtons = await msg.createMessageComponentCollector({
          filter: filterButtons,
          type: "BUTTON"
        })
        collectorButtons.on("collect", async (i) => {
          if (i.customId === "help_menu_button_home") {
            msg.edit({ embeds: [embed], components: [rowMenu, rowButtonsHomeDisabled] }).catch(() => { });
          }
        });

        // Select menu collector:
        const filterMenu = i => i.user.id === message.member.id;
        const collectorMenu = await msg.createMessageComponentCollector({
          filter: filterMenu,
          type: "SELECT_MENU",
          time: 300000
        });
        collectorMenu.on('collect', async (col) => {
          await col.deferUpdate().catch(() => { });

          try {
            const [directory] = col.values;

            const embedCommand = new MessageEmbed()
              .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
              .setTitle(`All commands for the category ${directory}:`)
              .setDescription(`> ${client.commands.filter(cmd => cmd.category === directory).map((cmd) => {
                return [` \`${cmd.name}\``].join(",")
              })}.`)
              .setColor("GREEN");

            msg.edit({ embeds: [embedCommand], components: [rowMenu, rowButtons] });
          } catch (e) {

          }
        });

        collectorMenu.on('end', async () => {
          const embedExpired = new MessageEmbed()
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setTitle(client.user.username + " - Help Menu:")
            .setDescription(`The service has been **expired**, try to run the command \`${config.prefix}help\` again.`)
            .setFooter(`Officially developed by: ${config.users.owner_tag}`)
            .setColor(config.messages.embeds.colors.no);

          msg.edit({ embeds: [embedExpired], components: [rowMenuDisabled, rowButtonsHomeDisabled] }).catch(() => { });
        });

      });

      // if {prefix}help (command):
    } else {

      const command =
        client.commands.get(args[0].toLowerCase()) ||
        client.commands.find(
          (c) => c.aliases && c.aliases.includes(args[0].toLowerCase())
        );

      if (!command) {
        const embed = new MessageEmbed()
          .setDescription(`${config.emojis.wrong} **Invalid Command!** Please recheck this command name by using: \`${config.prefix}help\`.`)
          .setColor(config.messages.embeds.colors.no);

        return message.reply({ embeds: [embed] }).then(async (timeout) => {
          await wait(5000);
          message.delete().catch(() => { });
          timeout.delete().catch(() => { });
        })

      } else {

        const embed = new MessageEmbed()
          .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() })
          .setTitle(`${command.name}.js - Command Information:`)
          .setDescription("There are two types of arguments when using one of the commands:\n`[...]`: Argument is **required**.\n`(...)`: Argument is **not required**.")
          .addFields(
            { name: "• Command Name:", value: command.name ? `\`${command.name}\`` : "[No name for this command]", inline: true },
            { name: "• Command Aliase(s):", value: command.aliases ? `\`${command.aliases.join(", ")}\`.` : "[No aliases for this command]", inline: true },
            { name: "• Command Category:", value: command.category ? `${command.category}` : "[No category for this command]", inline: true },
            { name: "• Command Description:", value: command.description ? command.description : "[No description for this command]", inline: true },
            { name: "• Command Usage:", value: command.usage ? `\`${config.prefix}${command.usage}\`` : `[No usage for this command]`, inline: true },
          )
          .setFooter({ text: `Requested By: ${message.author.tag}`, iconURL: message.member.displayAvatarURL() })
          .setTimestamp()
          .setColor("BLUE");

        return message.reply({ embeds: [embed] });

      }
    }

  },
};