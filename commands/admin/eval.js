const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { simpleEmbed } = require("../../utils/embeds.js");
const { ownerId } = require("../../config.json");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Exécuter du code")
		.addStringOption(option =>
			option.setName("code")
				.setDescription("Code à exécuter")
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(true),
	async execute(interaction) {
		if (interaction.user.id !== ownerId) return interaction.reply({ embeds: [simpleEmbed("Vous n'avez pas la permission d'utiliser cette commande !")], ephemeral: true });

		const code = interaction.options.getString("code");
		if (!code) return interaction.reply({ embeds: [simpleEmbed(`Veuillez saisir un code valide !`)], ephemeral: true });

		try {
			const output = await eval(code);
            const outputStr = output ? output.toString() : "Pas de sortie";
            await interaction.reply({ embeds:[simpleEmbed(`\`\`\`js\n${outputStr}\`\`\``)], ephemeral: true });
		} catch (error) {
			console.error(error);
			await interaction.reply({ embeds:[simpleEmbed(`Une erreur est survenue lors de l'exécution du code :\n\`${error.message}\``)], ephemeral: true });
		}
	}
};