const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { simpleEmbed } = require("../../utils/embeds.js");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("kick")
		.setDescription("Expulse un membre du serveur")
		.addUserOption(option =>
			option.setName("membre")
				.setDescription("Membre à expulser")
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("raison")
				.setDescription("Raison de l'expulsion")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.setDMPermission(false),
	async execute(interaction) {
		const user = interaction.options.getUser("membre");
		const member = interaction.options.getMember("membre");
		const reason = interaction.options.getString("raison") ?? "Aucune raison spécifiée";

		if (!user) return interaction.reply({ embeds: [simpleEmbed("Ce membre n'existe pas !")], ephemeral: true });
		if (!member) return interaction.reply({ embeds: [simpleEmbed(`<@${user.id}> n'est pas membre du serveur !`)], ephemeral: true });
		if (member.id === interaction.user.id) return interaction.reply({ embeds: [simpleEmbed("Vous ne pouvez pas vous expulser vous-même !")], ephemeral: true });
		if (member.id === interaction.guild.ownerId) return interaction.reply({ embeds: [simpleEmbed("Vous ne pouvez pas expulser le propriétaire du serveur !")], ephemeral: true });
		if (interaction.user.id !== interaction.guild.ownerId && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return interaction.reply({ embeds: [simpleEmbed(`Impossible d'expulser ${member} car ce membre possède le rôle ${member.roles.highest}, qui est supérieur ou égal à votre rôle le plus haut !`)], ephemeral: true });
		if (interaction.guild.members.me.roles.highest.comparePositionTo(member.roles.highest) <= 0) return interaction.reply({ embeds: [simpleEmbed(`Impossible d'expulser ${member} car ce membre possède le rôle ${member.roles.highest}, qui est supérieur ou égal à mon rôle le plus haut !`)], ephemeral: true });
		if (!member.kickable) return interaction.reply({ embeds: [simpleEmbed(`${member} ne peut pas être expulsé(e) !`)], ephemeral: true });

		const confirm = new ButtonBuilder()
			.setCustomId("confirm")
			.setLabel("Expulser")
			.setStyle(ButtonStyle.Danger);

		const cancel = new ButtonBuilder()
			.setCustomId("cancel")
			.setLabel("Annuler")
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(confirm, cancel);

		const response = await interaction.reply({
			embeds: [simpleEmbed(`Êtes-vous sûr de vouloir expulser ${member} pour la raison suivante ?\n\`${reason}\``)],
			components: [row]
		});

		const filter = async i => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({ embeds: [simpleEmbed("Vous ne pouvez pas confirmer ou annuler cette expulsion !")], ephemeral: true });
				return false;
			} else {
				return true;
			}
		};

		try {
			const confirmation = await response.awaitMessageComponent({ filter, time: 60_000 });

			if (confirmation.customId === "confirm") {
				await response.edit({ embeds: [simpleEmbed(`${member} a été expulsé(e).\nRaison : \`${reason}\``)], components: [] });
				await member.send({ embeds: [simpleEmbed(`Vous avez été expulsé(e) du serveur \`${interaction.guild.name}\` par ${interaction.user}.\nRaison : \`${reason}\``)] })
					.then(() => interaction.followUp({ embeds: [simpleEmbed(`${member} a été informé(e) de son expulsion par message privé !`)], ephemeral: true }))
					.catch(() => interaction.followUp({ embeds: [simpleEmbed(`${member} n'a pas pu être informé(e) de son expulsion par message privé !`)], ephemeral: true }));
				await member.kick(reason);
			} else if (confirmation.customId === "cancel") {
				await response.edit({ embeds: [simpleEmbed(`L'expulsion de ${member} a été annulée.`)], components: [] });
			}
		} catch (error) {
			await response.edit({ embeds: [simpleEmbed(`Aucune réponse reçue pendant 1 minute, l'expulsion de ${member} est annulée.`)], components: [] });
		}
	}
};