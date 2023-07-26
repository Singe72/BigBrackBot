const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { clientColor } = require("../../config.json");
const { simpleEmbed } = require("../../utils/embeds.js");
const buttonPages = require("../../utils/pagination.js");

module.exports = {
	cooldown: 5,
	category: "utilitaire",
	data: new SlashCommandBuilder()
		.setName("avatar")
		.setDescription("Afficher l'avatar d'un membre")
		.addUserOption(option =>
			option.setName("membre")
				.setDescription("Membre à afficher")
				.setRequired(false)
		)
		.setDMPermission(false),
	async execute(interaction) {
		const user = interaction.options.getUser("membre") || interaction.user;
		let member = interaction.options.getMember("membre");

		if (user && !member) {
			try {
				member = await interaction.guild.members.fetch(user.id);
			} catch (error) {
				member = null;
			}
		}

		if (!user) return interaction.reply({ embeds: [simpleEmbed("Ce membre n'existe pas !")], ephemeral: true });
		if (!member) return interaction.reply({ embeds: [simpleEmbed(`<@${user.id}> n'est pas membre du serveur !`)], ephemeral: true });

		const userAvatar = new EmbedBuilder()
			.setColor(clientColor)
			.setTitle(`Avatar de ${user.username}`)
			.setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }));

		if (!member.avatar) return interaction.reply({ embeds: [userAvatar] });

		const memberAvatar = new EmbedBuilder()
			.setColor(clientColor)
			.setTitle(`Avatar de ${member.nickname || user.username}`)
			.setImage(member.displayAvatarURL({ dynamic: true, size: 4096 }));

		const pages = [userAvatar, memberAvatar];
		buttonPages(interaction, pages, false);
	}
};