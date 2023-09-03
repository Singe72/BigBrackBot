const { Events } = require("discord.js");
const { logEmbed } = require("../../utils/embeds.js");
const { channels: { logs }, logsColors: { success, danger, warning } } = require("../../config.json");

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {
		if (oldState.channelId === newState.channelId) return;

		const { client, id } = newState;
		const member = newState.guild.members.cache.get(id);

		if (!oldState.channelId && newState.channelId) {
			try {
				const embed = logEmbed({
					color: success,
					user: member,
					description: `${member} a rejoint le salon <#${newState.channelId}>.`,
					footer: "Salon rejoint"
				});
				await client.channels.cache.get(logs).send({ embeds: [embed] });
			} catch (error) {
				console.error(error);
			}
		} else if (oldState.channelId && !newState.channelId) {
			try {
				const embed = logEmbed({
					color: danger,
					user: member,
					description: `${member} a quitté le salon <#${oldState.channelId}>.`,
					footer: "Salon quitté"
				});
				await client.channels.cache.get(logs).send({ embeds: [embed] });
			} catch (error) {
				console.error(error);
			}
		} else if (oldState.channelId && newState.channelId) {
			try {
				const embed = logEmbed({
					color: warning,
					user: member,
					description: `${member} s'est déplacé du salon <#${oldState.channelId}> vers le salon <#${newState.channelId}>.`,
					footer: "Salon changé"
				});
				await client.channels.cache.get(logs).send({ embeds: [embed] });
			} catch (error) {
				console.error(error);
			}
		}

	}
};