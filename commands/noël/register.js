const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { clientColor } = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("register")
		.setDescription("Mettre en place les inscriptions pour le Père Noël Secret")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setTitle("Père Noël Secret")
			.setDescription("**C'est l'heure du Père Noël Secret de BigBrackMar !** 🎉\n\nFaites vite, les inscriptions fermeront <t:1702508400:R> !")
			.setColor(clientColor);

		const registerButton = new ButtonBuilder()
			.setStyle(ButtonStyle.Success)
			.setEmoji("🎁")
			.setLabel("S'inscrire")
			.setCustomId("santa-register");

		const moreInfoButton = new ButtonBuilder()
			.setStyle(ButtonStyle.Secondary)
			.setEmoji("❔")
			.setLabel("En savoir plus")
			.setCustomId("santa-more-info");

		const row = new ActionRowBuilder()
			.addComponents(registerButton, moreInfoButton);

		await interaction.client.channels.cache.get("468808828582887425").send({ embeds: [embed], components: [row] });

		await interaction.reply("Message envoyé !");
	}
};