const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { simpleEmbed } = require("../../utils/embeds.js");
const { channels:{ suggestions }, clientColor } = require("../../config.json");

module.exports = {
	cooldown: 5,
	category: "utilitaire",
	data: new SlashCommandBuilder()
		.setName("suggest")
		.setDescription("Faire une suggestion")
		.addStringOption(option =>
			option.setName("nom")
				.setDescription("Nom de la suggestion")
				.setMinLength(10)
				.setMaxLength(100)
				.setRequired(true))
		.addStringOption(option =>
			option.setName("description")
				.setDescription("Description de la suggestion")
				.setMinLength(10)
				.setMaxLength(1000)
				.setRequired(true))
		.setDMPermission(true),
	async execute(interaction) {
		const name = interaction.options.getString("nom");
		const description = interaction.options.getString("description");

		await interaction.reply({ embeds:[simpleEmbed("Votre suggestion a bien été envoyée !")], ephemeral: true });

		const embed = new EmbedBuilder()
			.setColor(clientColor)
			.setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
			.setTitle("Nouvelle suggestion")
			.addFields({ name: name, value: description }
			)
			.setFooter({ text: `ID : ${interaction.user.id}` });

		await interaction.client.channels.cache.get(suggestions).send({ embeds: [embed] });
	}
};