const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { SantaGiving } = require("../../dbObjects");
const { simpleEmbed } = require("../../utils/embeds");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("mélanger")
		.setDescription("Mélanger les participants du Père Noël Secret")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(true),
	async execute(interaction) {
		const giving = await SantaGiving.findAll();

		for (const santa of giving) {
			const santaUser = await interaction.client.users.fetch(santa.santa_id);
			await santaUser.send({ embeds: [simpleEmbed("Les participants ont été mélangés ! Vous pouvez maintenant utiliser la commande `/profil-destinataire` pour voir le profil de votre destinataire.\n\nUtilisez la commande `/demander` pour lui parler !")] });
		}
	}
};