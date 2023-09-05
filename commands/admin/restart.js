const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { simpleEmbed } = require("../../utils/embeds.js");
const { ownerId } = require("../../config.json");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("restart")
		.setDescription("Redémarrer le bot")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(true),
	async execute(interaction) {
		if (interaction.user.id !== ownerId) return interaction.reply({ embeds: [simpleEmbed("Vous n'avez pas la permission d'utiliser cette commande !")], ephemeral: true });

		await interaction.reply({ embeds: [simpleEmbed("🤖 Redémarrage en cours...")], ephemeral: true });
		process.exit();
	}
};