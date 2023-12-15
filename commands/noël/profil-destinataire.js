const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { SantaGiving, SantaParticipants } = require("../../dbObjects");
const { clientColor } = require("../../config.json");
const { simpleEmbed } = require("../../utils/embeds");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("profil-destinataire")
		.setDescription("Afficher le profil de votre destinataire")
		.setDMPermission(true),
	async execute(interaction) {
		const { user } = interaction;

		const santa = await SantaGiving.findOne({ where: { santa_id: user.id } });

		if (!santa) {
			return await interaction.reply({ embeds: [simpleEmbed("Tu n'es pas inscrit(e) au Père Noël secret !")], ephemeral: true });
		}

		const receiver = await interaction.client.users.fetch(santa.receiver_id);

		const receiverProfile = await SantaParticipants.findOne({ where: { user_id: receiver.id } });

		const embed = new EmbedBuilder()
			.setColor(clientColor)
			.setTitle("Profil de votre destinataire")
			.setDescription("Posez-lui des questions avec la commande `/demander` !")
			.addFields(
				{ name: "🍔 Aliment préféré", value: receiverProfile.favorite_food },
				{ name: "📕 Matière préférée à l'école", value: receiverProfile.favorite_subject },
				{ name: "🎬 Film ou série préférée", value: receiverProfile.favorite_movie },
				{ name: "🔥 Marque préférée", value: receiverProfile.favorite_brand },
				{ name: "⚽ Sport préféré", value: receiverProfile.favorite_sport }
			);

		await interaction.reply({ embeds: [embed], ephemeral: true });
	}
};