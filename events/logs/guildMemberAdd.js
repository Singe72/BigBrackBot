const { Events } = require("discord.js");
const { logEmbed } = require("../../utils/embeds.js");
const { channels: { logs }, logsColors: { success } } = require("../../config.json");

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member) {
		const { client } = member;

		try {
			const embed = logEmbed({
				color: success,
				user: member,
				description: `${member} a rejoint le serveur.`,
				footer: "Nouveau membre"
			});
			await client.channels.cache.get(logs).send({ embeds: [embed] });
		} catch (error) {
			console.error(error);
		}
	}
};