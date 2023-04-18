const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { colorlessEmbed, errorEmbed, successEmbed } = require("../../utils/embeds.js");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("unban")
		.setDescription("Débannir un utilisateur")
		.addUserOption(option =>
			option.setName("utilisateur")
				.setDescription("ID de l'utilisateur à débannir")
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("raison")
				.setDescription("Raison du débannissement")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false),
	async execute(interaction) {
		const user = interaction.options.getUser("utilisateur");
		const reason = interaction.options.getString("raison") ?? "Aucune raison spécifiée";

		if (!user) return interaction.reply({ embeds: [errorEmbed("Cet utilisateur n'existe pas !")], ephemeral: true });

		const banned = (await interaction.guild.bans.fetch()).get(user.id);
		if (!banned) return interaction.reply({ embeds: [errorEmbed(`${user} n'est pas banni(e) !`)], ephemeral: true });

		const confirm = new ButtonBuilder()
			.setCustomId("confirm")
			.setLabel("Débannir")
			.setStyle(ButtonStyle.Success);

		const cancel = new ButtonBuilder()
			.setCustomId("cancel")
			.setLabel("Annuler")
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(confirm, cancel);

		const response = await interaction.reply({
			embeds: [colorlessEmbed(`Êtes-vous sûr de vouloir débannir ${user} pour la raison suivante ?\n\`${reason}\``)],
			components: [row]
		});

		const filter = async i => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({ embeds: [errorEmbed("Vous ne pouvez pas confirmer ou annuler ce débannissement !")], ephemeral: true });
				return false;
			} else {
				return true;
			}
		};

		try {
			const confirmation = await response.awaitMessageComponent({ filter, time: 60_000 });

			if (confirmation.customId === "confirm") {
				await response.edit({ embeds: [successEmbed(`${user} a été débanni(e).\nRaison : \`${reason}\``)], components: [] });
				await user.send({ embeds: [successEmbed(`Vous avez été débanni(e) du serveur \`${interaction.guild.name}\` par ${interaction.user}.\nRaison : \`${reason}\``)] })
					.then(() => interaction.followUp({ embeds: [successEmbed(`${user} a été informé(e) de son débannissement par message privé !`)], ephemeral: true }))
					.catch(() => interaction.followUp({ embeds: [errorEmbed(`${user} n'a pas pu être informé(e) de son débannissement par message privé !`)], ephemeral: true }));
				await interaction.guild.members.unban(user, reason);
			} else if (confirmation.customId === "cancel") {
				await response.edit({ embeds: [errorEmbed(`Le débannissement de ${user} a été annulé.`)], components: [] });
			}
		} catch (error) {
			await response.edit({ embeds: [errorEmbed(`Aucune réponse reçue pendant 1 minute, le débannissement de ${user} est annulée.`)], components: [] });
		}
	}
};