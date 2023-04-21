const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { colorlessEmbed, errorEmbed, successEmbed } = require("../../utils/embeds.js");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Bannir un membre du serveur")
		.addUserOption(option =>
			option.setName("membre")
				.setDescription("Membre à bannir")
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("raison")
				.setDescription("Raison du bannissement")
				.setRequired(false)
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option.setName("suppression_des_messages")
				.setDescription("Supprimer l'historique des messages du membre")
				.setRequired(false)
				.addChoices(
					{ name: "Ne rien supprimer", value: "Ne rien supprimer|0" },
					{ name: "Dernière heure", value: "Dernière heure|1" },
					{ name: "Dernières 6 heures", value: "Dernières 6 heures|6" },
					{ name: "Dernières 12 heures", value: "Dernières 12 heures|12" },
					{ name: "Dernières 24 heures", value: "Dernières 24 heures|24" },
					{ name: "3 derniers jours", value: "3 derniers jours|72" },
					{ name: "7 derniers jours", value: "7 derniers jours|168" }
				)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const choices = ["Compte suspect ou spam", "Compte compromis ou piraté", "Non-respect des règles du serveur"];
		const filtered = choices.filter(choice => choice.startsWith(focusedValue));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice }))
		);
	},
	async execute(interaction) {
		const user = interaction.options.getUser("membre");
		const member = interaction.options.getMember("membre");
		const reason = interaction.options.getString("raison") ?? "Aucune raison spécifiée";

		if (!user) return interaction.reply({ embeds: [errorEmbed("Ce membre n'existe pas !")], ephemeral: true });
		if (!member) return interaction.reply({ embeds: [errorEmbed(`<@${user.id}> n'est pas membre du serveur !`)], ephemeral: true });
		if (member.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed("Vous ne pouvez pas vous bannir vous-même !")], ephemeral: true });
		if (member.id === interaction.guild.ownerId) return interaction.reply({ embeds: [errorEmbed("Vous ne pouvez pas bannir le propriétaire du serveur !")], ephemeral: true });
		if (interaction.user.id !== interaction.guild.ownerId && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return interaction.reply({ embeds: [errorEmbed(`Impossible de bannir ${member} car ce membre possède le rôle ${member.roles.highest}, qui est supérieur ou égal à votre rôle le plus haut !`)], ephemeral: true });
		if (interaction.guild.members.me.roles.highest.comparePositionTo(member.roles.highest) <= 0) return interaction.reply({ embeds: [errorEmbed(`Impossible de bannir ${member} car ce membre possède le rôle ${member.roles.highest}, qui est supérieur ou égal à mon rôle le plus haut !`)], ephemeral: true });
		if (!member.bannable) return interaction.reply({ embeds: [errorEmbed(`${member} ne peut pas être banni(e) !`)], ephemeral: true });

		const deleteTime = interaction.options.getString("suppression_des_messages") ?? "Ne rien supprimer|0";
		const deleteTimeString = deleteTime.split("|")[0];
		const deleteTimeNumber = parseInt(deleteTime.split("|")[1]) * 3600;

		const confirm = new ButtonBuilder()
			.setCustomId("confirm")
			.setLabel("Bannir")
			.setStyle(ButtonStyle.Danger);

		const cancel = new ButtonBuilder()
			.setCustomId("cancel")
			.setLabel("Annuler")
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(confirm, cancel);

		const response = await interaction.reply({
			embeds: [colorlessEmbed(`Êtes-vous sûr de vouloir bannir ${member} pour la raison suivante ?\n\`${reason}\`\n\nSupprimer l'historique des messages :\n\`${deleteTimeString}\``)],
			components: [row]
		});

		const filter = async i => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({ embeds: [errorEmbed("Vous ne pouvez pas confirmer ou annuler ce bannissement !")], ephemeral: true });
				return false;
			} else {
				return true;
			}
		};

		try {
			const confirmation = await response.awaitMessageComponent({ filter, time: 60_000 });

			if (confirmation.customId === "confirm") {
				await response.edit({ embeds: [successEmbed(`${member} a été banni(e).\nRaison : \`${reason}\``)], components: [] });
				await member.send({ embeds: [errorEmbed(`Vous avez été banni(e) du serveur \`${interaction.guild.name}\` par ${interaction.user}.\nRaison : \`${reason}\``)] })
					.then(() => interaction.followUp({ embeds: [successEmbed(`${member} a été informé(e) de son bannissement par message privé !`)], ephemeral: true }))
					.catch(() => interaction.followUp({ embeds: [errorEmbed(`${member} n'a pas pu être informé(e) de son bannissement par message privé !`)], ephemeral: true }));
				await member.ban({ deleteMessageSeconds: deleteTimeNumber, reason: reason });
			} else if (confirmation.customId === "cancel") {
				await response.edit({ embeds: [errorEmbed(`Le bannissement de ${member} a été annulé.`)], components: [] });
			}
		} catch (error) {
			await response.edit({ embeds: [errorEmbed(`Aucune réponse reçue pendant 1 minute, le bannissement de ${member} est annulé.`)], components: [] });
		}
	}
};