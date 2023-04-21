const { PermissionFlagsBits, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { colorlessEmbed, errorEmbed, successEmbed } = require("../../utils/embeds");
const ms = require("ms");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("timeout")
		.setDescription("Exclure temporairement un membre du serveur")
		.addUserOption(option =>
			option.setName("membre")
				.setDescription("Membre à exclure temporairement")
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("durée")
				.setDescription("Durée de l'exclusion temporaire (ex : 30, 60s, 5m, 1h, 2d, 3w)")
				.setRequired(true)
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option.setName("raison")
				.setDescription("Raison de l'exclusion temporaire")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.setDMPermission(false),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const choices = [
			{ name: "60 secondes", value: "60s" },
			{ name: "5 minutes", value: "5m" },
			{ name: "10 minutes", value: "10m" },
			{ name: "1 heure", value: "1h" },
			{ name: "1 jour", value: "1d" },
			{ name: "1 semaine", value: "1w" }
		];
		const filtered = choices.filter(choice => choice.name.startsWith(focusedValue));
		await interaction.respond(
			filtered.map(choice => ({ name: choice.name, value: choice.value }))
		);
	},
	async execute(interaction) {
		const user = interaction.options.getUser("membre");
		const member = interaction.options.getMember("membre");
		const reason = interaction.options.getString("raison") ?? "Aucune raison spécifiée";

		if (!user) return interaction.reply({ embeds: [errorEmbed("Ce membre n'existe pas !")], ephemeral: true });
		if (!member) return interaction.reply({ embeds: [errorEmbed(`<@${user.id}> n'est pas membre du serveur !`)], ephemeral: true });
		if (member.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed("Vous ne pouvez pas vous timeout vous-même !")], ephemeral: true });
		if (member.id === interaction.guild.ownerId) return interaction.reply({ embeds: [errorEmbed("Vous ne pouvez pas timeout le propriétaire du serveur !")], ephemeral: true });
		if (interaction.user.id !== interaction.guild.ownerId && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return interaction.reply({ embeds: [errorEmbed(`Impossible de timeout ${member} car ce membre possède le rôle ${member.roles.highest}, qui est supérieur ou égal à votre rôle le plus haut !`)], ephemeral: true });
		if (interaction.guild.members.me.roles.highest.comparePositionTo(member.roles.highest) <= 0) return interaction.reply({ embeds: [errorEmbed(`Impossible de timeout ${member} car ce membre possède le rôle ${member.roles.highest}, qui est supérieur ou égal à mon rôle le plus haut !`)], ephemeral: true });
		if (!member.moderatable) return interaction.reply({ embeds: [errorEmbed(`${member} ne peut pas être temporairement exclu(e) !`)], ephemeral: true });

		const duration = interaction.options.getString("durée");
		if (!duration) return interaction.reply({ embeds: [errorEmbed("Veuillez spécifier une durée valide !")], ephemeral: true });
		const time = ms(duration);
		if (isNaN(time)) return interaction.reply({ embeds: [errorEmbed("Veuillez spécifier une durée valide !")], ephemeral: true });
		if (time < 0 || time > 2419200000) return interaction.reply({ embeds: [errorEmbed("Veuillez spécifier une durée comprise entre 0 et 28 jours !")], ephemeral: true });

		if (member.isCommunicationDisabled()) {
			const mutedTimestamp = parseInt(member.communicationDisabledUntilTimestamp / 1000);
			return interaction.reply({ embeds: [errorEmbed(`${member} est déjà timed out et pourra à nouveau communiquer <t:${mutedTimestamp}:R> !`)], ephemeral: true });
		}

		const confirm = new ButtonBuilder()
			.setCustomId("confirm")
			.setLabel("Exclure temporairement")
			.setStyle(ButtonStyle.Danger);

		const cancel = new ButtonBuilder()
			.setCustomId("cancel")
			.setLabel("Annuler")
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(confirm, cancel);

		const response = await interaction.reply({
			embeds: [colorlessEmbed(`Êtes-vous sûr de vouloir exclure temporairement ${member} avec les paramètres suivants ?\n\nDurée : \`${duration}\`\nRaison : \`${reason}\``)],
			components: [row]
		});

		const filter = async i => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({ embeds: [errorEmbed("Vous ne pouvez pas confirmer ou annuler cette exclusion temporaire !")], ephemeral: true });
				return false;
			} else {
				return true;
			}
		};

		try {
			const confirmation = await response.awaitMessageComponent({ filter, time: 60_000 });

			if (confirmation.customId === "confirm") {
				await response.edit({ embeds: [successEmbed(`${member} a été temporairement exclu(e).\n\nDurée : \`${duration}\`\nRaison : \`${reason}\``)], components: [] });
				await member.send({ embeds: [errorEmbed(`Vous avez été temporairement exclu(e) du serveur \`${interaction.guild.name}\` par ${interaction.user}.\n\nDurée : \`${duration}\`\nRaison : \`${reason}\``)] })
					.then(() => interaction.followUp({ embeds: [successEmbed(`${member} a été informé(e) de son exclusion temporaire par message privé !`)], ephemeral: true }))
					.catch(() => interaction.followUp({ embeds: [errorEmbed(`${member} n'a pas pu être informé(e) de son exclusion temporaire par message privé !`)], ephemeral: true }));
				await member.timeout(time, reason);
			} else if (confirmation.customId === "cancel") {
				await response.edit({ embeds: [errorEmbed(`L'exclusion temporaire de ${member} a été annulée.`)], components: [] });
			}
		} catch (error) {
			await response.edit({ embeds: [errorEmbed(`Aucune réponse reçue pendant 1 minute, l'exclusion temporaire de ${member} est annulée.`)], components: [] });
		}
	}
};