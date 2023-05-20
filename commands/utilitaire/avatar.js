const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { clientColor } = require("../../config.json");
const { simpleEmbed } = require("../../utils/embeds.js");


module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("avatar")
		.setDescription("Afficher l'avatar d'un membre")
		.addUserOption(option =>
			option.setName("membre")
				.setDescription("Membre à afficher")
				.setRequired(false)
		),
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

		const embed = new EmbedBuilder()
			.setColor(clientColor)
			.setTitle(`Avatar de ${member.nickname || member.user.username}`)
			.setImage(member.user.displayAvatarURL({ dynamic: true, size: 4096 }));

		await interaction.reply({ embeds: [embed] });
	}
};