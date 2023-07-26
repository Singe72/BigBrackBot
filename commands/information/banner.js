const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { clientColor } = require("../../config.json");
const { simpleEmbed } = require("../../utils/embeds.js");

module.exports = {
	cooldown: 5,
	category: "information",
	data: new SlashCommandBuilder()
		.setName("banner")
		.setDescription("Afficher la bannière d'un membre")
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
		if (!(await user.fetch()).banner) return interaction.reply({ embeds: [simpleEmbed(`${member} n'a pas de bannière !`)], ephemeral: true });

		const embed = new EmbedBuilder()
			.setColor(clientColor)
			.setTitle(`Bannière de ${member.nickname || user.username}`)
			.setImage((await user.fetch()).bannerURL({ dynamic: true, size: 4096 }));

		await interaction.reply({ embeds: [embed] });
	}
};