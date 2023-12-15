const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { SantaGiving } = require("../../dbObjects");
const { clientColor } = require("../../config.json");
const { simpleEmbed } = require("../../utils/embeds");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("répondre")
		.setDescription("Répondre à votre Père Noël Secret")
		.addStringOption(option =>
			option.setName("message")
				.setDescription("Le message à envoyer")
				.setRequired(true))
		.setDMPermission(true),
	async execute(interaction) {
		const { user } = interaction;

		const participant = await SantaGiving.findOne({ where: { receiver_id: user.id } });
		if (!participant) return interaction.reply({ embeds: [simpleEmbed("Vous n'êtes pas inscrit(e) au Père Noël Secret !")], ephemeral: true });

		const santaUser = await interaction.client.users.fetch(participant.santa_id);
		const message = interaction.options.getString("message");

		const embed = new EmbedBuilder()
			.setColor(clientColor)
			.setTitle("Message de votre destinataire")
			.setDescription(`${message}\n\n\nPour lui poser d'autres questions, utilisez la commande \`/demander\` !`);

		await santaUser.send({ embeds: [embed] });

		await interaction.reply({ embeds: [simpleEmbed("Votre message a bien été envoyé à votre père Noël secret !").addFields({ name: "Contenu", value: message })], ephemeral: true });
	}
};