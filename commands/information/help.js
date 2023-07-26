const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	cooldown: 5,
	category: "utilitaire",
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Affiche la liste des commandes")
		.setDMPermission(true),
	async execute(interaction) {
		console.log(interaction.client.commands.map(command => command.folder));
		return interaction.reply(interaction.client.commands.map(command => command.data.name).join("\n"));
	}
};