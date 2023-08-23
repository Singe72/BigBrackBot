const { Events } = require("discord.js");
const { logEmbed } = require("../../utils/embeds.js");
const { channels: { logs }, logsColors: { danger } } = require("../../config.json");

module.exports = {
	name: Events.GuildMemberRemove,
	async execute(member) {
		const { client } = member;

		try {
			const embed = logEmbed({
				color: danger,
				user: member,
				description: `${member} a quitté le serveur.`,
				footer: "Membre parti"
			});
			await client.channels.cache.get(logs).send({ embeds: [embed] });
		} catch (error) {
			console.error(error);
		}
	}
};