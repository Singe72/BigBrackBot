const { Events } = require("discord.js");
const { logEmbed } = require("../../utils/embeds.js");
const { channels: { logs }, logsColors: { warning } } = require("../../config.json");

module.exports = {
	name: Events.MessageUpdate,
	async execute(oldMessage, newMessage) {
		const { author, channel, client, url } = newMessage;

		if (oldMessage.content === newMessage.content) return;
		if (newMessage.author.bot) return;

		try {
			await oldMessage.fetch();
			await newMessage.fetch();

			const embed = logEmbed({
				color: warning,
				user: author,
				description: `${author} a modifié son [message](${url}) dans le salon ${channel}.`,
				footer: "Message modifié"
			}).addFields(
				{ name: "Ancien message", value: oldMessage.partial ? "⚠️ Le contenu de ce message n'a pas pu être récupéré." : oldMessage.content },
				{ name: "Nouveau message", value: newMessage.content }
			);
			await client.channels.cache.get(logs).send({ embeds: [embed] });
		} catch (error) {
			console.error(error);
		}
	}
};