const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { colorlessEmbed, errorEmbed, successEmbed } = require("../../utils/embeds");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("untimeout")
		.setDescription("Révoquer l'exclusion temporaire d'un membre du serveur")
		.addUserOption(option =>
			option.setName("membre")
				.setDescription("Membre à révoquer")
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("raison")
				.setDescription("Raison de la révocation")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.setDMPermission(false),
	async execute(interaction) {
		const user = interaction.options.getUser("membre");
		const member = interaction.options.getMember("membre");
		const reason = interaction.options.getString("raison") ?? "Aucune raison spécifiée";

		if (!user) return interaction.reply({ embeds: [errorEmbed("Cet utilisateur n'existe pas !")], ephemeral: true });
		if (!member) return interaction.reply({ embeds: [errorEmbed(`<@${user.id}> n'est pas membre du serveur !`)], ephemeral: true });
		if (!member.isCommunicationDisabled()) return interaction.reply({ embeds: [errorEmbed(`${member} n'est pas timed out !`)] });

		const confirm = new ButtonBuilder()
			.setCustomId("confirm")
			.setLabel("Révoquer l'exclusion temporaire")
			.setStyle(ButtonStyle.Success);

		const cancel = new ButtonBuilder()
			.setCustomId("cancel")
			.setLabel("Annuler")
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(confirm, cancel);

		const mutedTimestamp = parseInt(member.communicationDisabledUntilTimestamp / 1000);
		const response = await interaction.reply({
			embeds: [colorlessEmbed(`Êtes-vous sûr de vouloir révoquer l'exclusion temporaire de ${member} avec la raison suivante ?\n\`${reason}\`\n\nActuellement, ${member} pourra de nouveau communiquer <t:${mutedTimestamp}:R>.`)],
			components: [row]
		});

		const filter = async i => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({ embeds: [errorEmbed("Vous ne pouvez pas confirmer ou annuler cette révocation d'exclusion temporaire !")], ephemeral: true });
				return false;
			} else {
				return true;
			}
		};

		try {
			const confirmation = await response.awaitMessageComponent({ filter, time: 60_000 });

			if (confirmation.customId === "confirm") {
				await response.edit({ embeds: [successEmbed(`${user} peut de nouveau communiquer.\nRaison : \`${reason}\``)], components: [] });
				await user.send({ embeds: [successEmbed(`Votre exclusion temporaire du serveur \`${interaction.guild.name}\` a été révoquée par ${interaction.user}.\nRaison : \`${reason}\``)] })
					.then(() => interaction.followUp({ embeds: [successEmbed(`${user} a été informé(e) de la révocation de son exclusion temporaire par message privé !`)], ephemeral: true }))
					.catch(() => interaction.followUp({ embeds: [errorEmbed(`${user} n'a pas pu être informé(e) de la révocation de son exclusion temporaire par message privé !`)], ephemeral: true }));
				await member.timeout(null, reason);
			} else if (confirmation.customId === "cancel") {
				await response.edit({ embeds: [errorEmbed(`La révocation de l'exclusion temporaire de ${member} a été annulée.`)], components: [] });
			}
		} catch (error) {
			await response.edit({ embeds: [errorEmbed(`Aucune réponse reçue pendant 1 minute, la révocation de l'exclusion temporaire de ${member} est annulée.`)], components: [] });
		}
	}
};