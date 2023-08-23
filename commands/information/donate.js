const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require("discord.js");
const { simpleEmbed } = require("../../utils/embeds.js");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("donate")
		.setDescription("Soutenir financièrement le bot")
		.setDMPermission(true),
	async execute(interaction) {
		const button = new ButtonBuilder()
			.setStyle(ButtonStyle.Link)
			.setEmoji("1142780468715077712")
			.setLabel("Faire un don")
			.setURL("https://paypal.me/singe72");

		const row = new ActionRowBuilder().addComponents(button);

		await interaction.reply({ embeds: [simpleEmbed(`Merci de votre soutien ! 🎉\nVos dons contribuent à l'hébergement de ${interaction.client.user}.`)], components: [row], ephemeral: true });
	}
};