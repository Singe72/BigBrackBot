const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { simpleEmbed } = require("../../utils/embeds.js");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("restart")
		.setDescription("Redémarrer le bot")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(true),
	async execute(interaction) {
		await interaction.reply({ embeds: [simpleEmbed("🤖 Redémarrage en cours...")], ephemeral: true });
		process.exit();
	}
};