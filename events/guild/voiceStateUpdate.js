const { Events } = require("discord.js");
const { logEmbed } = require("../../utils/embeds.js");
const { channels: { logs }, logsColors: { success, danger, warning } } = require("../../config.json");

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {
		const { client, id } = newState;

		// Make bot leave voice channel if alone
		const channel = oldState?.channel;
		if (channel) {
			const humans = channel.members.filter(m => !m.user.bot);
			if (humans.size === 0) {
				const player = client.lavalink?.getPlayer?.(channel.guild.id);
				if (player && player.voiceChannelId === channel.id) {
					await player.destroy().catch(() => null);
				}
			}
		}

		// Logging voice state updates
		if (oldState.channelId === newState.channelId) return;

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