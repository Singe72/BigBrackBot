const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Affiche la latence du bot"),
	async execute(interaction) {
		await interaction.reply("Pong!");
	}
};