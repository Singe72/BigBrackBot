const { Events } = require("discord.js");
const { logEmbed } = require("../../utils/embeds.js");
const { channels: { logs }, logsColors: { success, danger, warning } } = require("../../config.json");
const { isVoiceChannelEmpty } = require("distube");

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {
		// Make bot leave voice channel if alone
		if (oldState?.channel) {
			const voice = newState.client.distube.voices.get(oldState);
			if (voice && isVoiceChannelEmpty(oldState)) {
				voice.leave();
			}
		}

		// Logging voice state updates
		if (oldState.channelId === newState.channelId) return;

		const { client, id } = newState;
		const member = newState.guild.members.cache.get(id);

		if (!oldState.channelId && newState.channelId) {
			try {
				const embed = logEmbed({
					color: success,
					user: member.user,
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
					user: member.user,
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
					user: member.user,
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