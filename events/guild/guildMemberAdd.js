const { AttachmentBuilder, EmbedBuilder, Events } = require("discord.js");
const { Profile } = require("discord-arts");
const { logEmbed } = require("../../utils/embeds.js");
const { channels: { logs }, clientColor, logsColors: { success } } = require("../../config.json");

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

		try {
			const profileBuffer = await Profile(member.id, {
				badgesFrame: true,
				presenceStatus: "online",
				customDate: member.user.createdAt,
				localDateType: 'fr-FR',
			});
			const imageAttachment = new AttachmentBuilder(profileBuffer, { name: "welcome.png" });

			const embed = new EmbedBuilder()
				.setColor(clientColor)
				.setDescription(`**👋 Bienvenue sur le serveur ${member} !**`)
				.setImage("attachment://welcome.png");

			const { systemChannel } = member.guild;
			const welcomeMessage = await systemChannel.send({ embeds: [embed], files: [imageAttachment] });
			await welcomeMessage.react("<a:wave_gif:1146859208562712586>");
		} catch (error) {
			console.error(error);
		}
	}
};