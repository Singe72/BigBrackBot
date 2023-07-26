const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { clientColor } = require("../../config.json");
const { simpleEmbed } = require("../../utils/embeds.js");
const { v4: uuidv4 } = require("uuid");
const { Warns } = require("../../dbObjects.js");
const buttonPages = require("../../utils/pagination.js");

module.exports = {
	cooldown: 5,
	category: "modération",
	data: new SlashCommandBuilder()
		.setName("warn")
		.setDescription("Gérer les warns")
		.addSubcommand(subcommand =>
			subcommand
				.setName("add")
				.setDescription("Ajouter un warn")
				.addUserOption(option =>
					option.setName("membre")
						.setDescription("Membre à warn")
						.setRequired(true)
				)
				.addStringOption(option =>
					option.setName("raison")
						.setDescription("Raison du warn")
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("remove")
				.setDescription("Retirer un warn")
				.addStringOption(option =>
					option.setName("id")
						.setDescription("ID du warn à retirer")
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("list")
				.setDescription("Lister les warns d'un membre")
				.addUserOption(option =>
					option.setName("membre")
						.setDescription("Membre dont lister les warns")
						.setRequired(false)
				)
		)
		.setDMPermission(false),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "add") {
			const user = interaction.options.getUser("membre");
			const member = interaction.options.getMember("membre");
			const reason = interaction.options.getString("raison");
			const warnId = uuidv4();

			if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ embeds: [simpleEmbed("Vous n'avez pas la permission d'utiliser cette commande !")], ephemeral: true });

			if (!user) return interaction.reply({ embeds: [simpleEmbed("Ce membre n'existe pas !")], ephemeral: true });
			if (!member) return interaction.reply({ embeds: [simpleEmbed(`<@${user.id}> n'est pas membre du serveur !`)], ephemeral: true });

			const confirm = new ButtonBuilder()
				.setCustomId("confirm")
				.setLabel("Warn")
				.setStyle(ButtonStyle.Danger);

			const cancel = new ButtonBuilder()
				.setCustomId("cancel")
				.setLabel("Annuler")
				.setStyle(ButtonStyle.Secondary);

			const row = new ActionRowBuilder()
				.addComponents(confirm, cancel);

			const response = await interaction.reply({
				embeds: [simpleEmbed(`Êtes-vous sûr de vouloir warn ${member} ?\n\nRaison : \`${reason}\`\nID : \`${warnId}\``)],
				components: [row]
			});

			const filter = async i => {
				if (i.user.id !== interaction.user.id) {
					await i.reply({ embeds: [simpleEmbed("Vous ne pouvez pas confirmer ou annuler ce warn !")], ephemeral: true });
					return false;
				} else {
					return true;
				}
			};

			try {
				const confirmation = await response.awaitMessageComponent({ filter, time: 60_000 });

				if (confirmation.customId === "confirm") {
					await Warns.create({
						warn_id: warnId,
						user_id: user.id,
						reason: reason,
						author_id: interaction.user.id
					});
					await response.edit({ embeds: [simpleEmbed(`${member} a été sanctionné(e).\n\nRaison : \`${reason}\`\nID : \`${warnId}\``)], components: [] });
				} else if (confirmation.customId === "cancel") {
					await response.edit({ embeds: [simpleEmbed(`Le warn de ${member} a été annulé.`)], components: [] });
				}
			} catch (error) {
				await response.edit({ embeds: [simpleEmbed(`Aucune réponse reçue pendant 1 minute, le warn de ${member} est annulé.`)], components: [] });
			}
		} else if (subcommand === "remove") {
			if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ embeds: [simpleEmbed("Vous n'avez pas la permission d'utiliser cette commande !")], ephemeral: true });

			const warnId = interaction.options.getString("id");

			const warn = await Warns.findOne({ where: { warn_id: warnId } });
			if (!warn) return interaction.reply({ embeds: [simpleEmbed("Aucun warn ne correspond à cet ID !")], ephemeral: true });

			const confirm = new ButtonBuilder()
				.setCustomId("confirm")
				.setLabel("Warn")
				.setStyle(ButtonStyle.Danger);

			const cancel = new ButtonBuilder()
				.setCustomId("cancel")
				.setLabel("Annuler")
				.setStyle(ButtonStyle.Secondary);

			const row = new ActionRowBuilder()
				.addComponents(confirm, cancel);

			const response = await interaction.reply({
				embeds: [simpleEmbed(`Êtes-vous sûr de vouloir supprimer le warn \`${warnId}\` ?`)],
				components: [row]
			});

			const filter = async i => {
				if (i.user.id !== interaction.user.id) {
					await i.reply({ embeds: [simpleEmbed("Vous ne pouvez pas confirmer ou annuler ce warn !")], ephemeral: true });
					return false;
				} else {
					return true;
				}
			};

			try {
				const confirmation = await response.awaitMessageComponent({ filter, time: 60_000 });

				if (confirmation.customId === "confirm") {
					await Warns.destroy({ where: { warn_id: warnId } });
					await response.edit({ embeds: [simpleEmbed(`Le warn \`${warnId}\` a été retiré.`)], components: [] });
				} else if (confirmation.customId === "cancel") {
					await response.edit({ embeds: [simpleEmbed(`Le retrait du warn \`${warnId}\` est annulé.`)], components: [] });
				}
			} catch (error) {
				await response.edit({ embeds: [simpleEmbed(`Aucune réponse reçue pendant 1 minute, le retrait du warn \`${warnId}\` est annulé.`)], components: [] });
			}

		} else if (subcommand === "list") {
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

			const warns = await Warns.findAll({ where: { user_id: user.id } });

			if (warns.length === 0) return interaction.reply({ embeds: [simpleEmbed(`${member} ne possède aucun warn.`)] });

			let page;
			const pages = [];
			for (let i = 0; i < warns.length; i++) {
				if (i % 25 === 0) {
					page = new EmbedBuilder()
						.setColor(clientColor)
						.setTitle(`Warns de ${member.displayName} (${warns.length})`)
						.setThumbnail(member.displayAvatarURL({ dynamic: true }));

					pages.push(page);
				}

				page.addFields([
					{
						name: `Warn n°${i + 1}`,
						value: `> **Auteur** : <@${warns[i].author_id}>
						> **Raison** : \`${warns[i].reason}\`
						> **Date** : <t:${parseInt(warns[i].createdAt.getTime() / 1000)}:F>
						> **ID** : \`${warns[i].warn_id}\``
					}
				]);
			}
			return buttonPages(interaction, pages, false);
		}
	}
};