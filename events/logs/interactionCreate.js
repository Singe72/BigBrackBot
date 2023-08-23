const { Events } = require("discord.js");
const { logEmbed } = require("../../utils/embeds.js");
const { channels: { logs }, logsColors: { info } } = require("../../config.json");

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

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
	}
};