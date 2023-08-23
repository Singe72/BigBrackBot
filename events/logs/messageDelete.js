const { Events } = require("discord.js");
const { logEmbed } = require("../../utils/embeds.js");
const { channels: { logs }, logsColors: { danger } } = require("../../config.json");

module.exports = {
	name: Events.MessageDelete,
	async execute(message) {
		if (message.partial) return;

		const { author, channel, client, content } = message;

		if (author.bot) return;

		try {
			const embed = logEmbed({
				color: danger,
				user: author,
				description: `Un message de ${author} a été supprimé dans le salon ${channel}.`,
				footer: "Message supprimé"
			}).addFields(
				{ name: "Message", value: content }
			);
			await client.channels.cache.get(logs).send({ embeds: [embed] });
		} catch (error) {
			console.error(error);
		}
	}
};