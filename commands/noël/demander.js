const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { SantaGiving } = require("../../dbObjects");
const { simpleEmbed } = require("../../utils/embeds");
const { clientColor } = require("../../config.json");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("demander")
		.setDescription("Parler à votre destinataire")
		.addStringOption(option =>
			option.setName("message")
				.setDescription("Le message à envoyer")
				.setRequired(true))
		.setDMPermission(true),
	async execute(interaction) {
		const { user } = interaction;

		const participant = await SantaGiving.findOne({ where: { santa_id: user.id } });
		if (!participant) return interaction.reply({ embeds: [simpleEmbed("Vous n'êtes pas inscrit au Père Noël Secret !")], ephemeral: true });

		const receiverUser = await interaction.client.users.fetch(participant.receiver_id);
		const message = interaction.options.getString("message");

		const embed = new EmbedBuilder()
			.setColor(clientColor)
			.setTitle("Message de votre Père Noël Secret")
			.setDescription(`${message}\n\n\nPour lui répondre, utilisez la commande \`/répondre\` !`);

		await receiverUser.send({ embeds: [embed] });

		await interaction.reply({ embeds: [simpleEmbed("Votre message a bien été envoyé à votre destinataire !").addFields({ name: "Contenu", value: message })], ephemeral: true });
	}
};