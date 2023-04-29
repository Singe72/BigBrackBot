const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { colors: { colorless } } = require("../../config.json");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Affiche la latence du bot")
		.setDMPermission(true),
	async execute(interaction) {
		await interaction.deferReply();

		const reply = await interaction.fetchReply();
		const clientPing = reply.createdTimestamp - interaction.createdTimestamp;
		const wsPing = interaction.client.ws.ping;

		const emojis = ["🟢", "🟡", "🔴"];

		const embed = new EmbedBuilder()
			.setColor(colorless)
			.setTitle("🏓 Pong !")
			.addFields(
				{ name: "Latence Bot", value: `\`${clientPing < 200 ? emojis[0] : clientPing < 400 ? emojis[1] : emojis[2]}\` ${clientPing}ms` },
				{ name: "Latence WebSocket", value: `\`${wsPing < 200 ? emojis[0] : wsPing < 400 ? emojis[1] : emojis[2]}\` ${wsPing}ms` }
			);

		await interaction.editReply({ embeds: [embed] });
	}
};