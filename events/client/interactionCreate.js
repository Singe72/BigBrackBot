const { Collection, Events } = require("discord.js");
const { simpleEmbed, logEmbed } = require("../../utils/embeds.js");
const { channels: { logs }, logsColors: { info } } = require("../../config.json");

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			const { cooldowns } = interaction.client;

			if (!cooldowns.has(command.data.name)) {
				cooldowns.set(command.data.name, new Collection());
			}

			const now = Date.now();
			const timestamps = cooldowns.get(command.data.name);
			const defaultCooldownDuration = 3;
			const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

				if (now < expirationTime) {
					const expiredTimestamp = Math.round(expirationTime / 1000);
					return interaction.reply({ embeds: [simpleEmbed(`Veuillez patienter, vous êtes en cooldown pour la commande \`${command.data.name}\`.\nVous pourrez à nouveau l'utiliser <t:${expiredTimestamp}:R>.`)], ephemeral: true });
				}
			}

			timestamps.set(interaction.user.id, now);
			setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}

			const { channel, client, user } = interaction;

			try {
				const embed = logEmbed({
					color: info,
					user,
					description: `${user} a utilisé la commande \`${interaction}\` dans le salon ${channel}.`,
					footer: "Commande utilisée"
				});
				await client.channels.cache.get(logs).send({ embeds: [embed] });
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.isAutocomplete()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				console.error(error);
			}
		}
	}
};