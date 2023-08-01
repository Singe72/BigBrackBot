const { SlashCommandBuilder } = require("discord.js");
const { Tags } = require("../../dbObjects.js");
const { simpleEmbed } = require("../../utils/embeds.js");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("tag")
		.setDescription("Gérer les tags")
		.addSubcommand(subcommand =>
			subcommand.setName("create")
				.setDescription("Ajouter un tag")
				.addStringOption(option =>
					option.setName("nom")
						.setDescription("Nom du tag")
						.setRequired(true)
				)
				.addStringOption(option =>
					option.setName("description")
						.setDescription("Description du tag")
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName("show")
				.setDescription("Afficher un tag")
				.addStringOption(option =>
					option.setName("nom")
						.setDescription("Nom du tag")
						.setRequired(true)
						.setAutocomplete(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName("edit")
				.setDescription("Modifier un tag")
				.addStringOption(option =>
					option.setName("nom")
						.setDescription("Nom du tag")
						.setRequired(true)
						.setAutocomplete(true)
				)
				.addStringOption(option =>
					option.setName("description")
						.setDescription("Description du tag")
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName("info")
				.setDescription("Afficher les informations d'un tag")
				.addStringOption(option =>
					option.setName("nom")
						.setDescription("Nom du tag")
						.setRequired(true)
						.setAutocomplete(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName("list")
				.setDescription("Afficher la liste des tags")
		)
		.addSubcommand(subcommand =>
			subcommand.setName("delete")
				.setDescription("Supprimer un tag")
				.addStringOption(option =>
					option.setName("nom")
						.setDescription("Nom du tag")
						.setRequired(true)
						.setAutocomplete(true)
				)
		)
		.setDMPermission(true),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const choices = await Tags.findAll({ attributes: ["name"] }).then(tags => tags.map(tag => tag.name));
		const filtered = choices.filter(choice => choice.startsWith(focusedValue));
		const filteredLimit = filtered.slice(0, 25);
		await interaction.respond(
			filteredLimit.map(choice => ({ name: choice, value: choice }))
		);
	},
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "create") {
			const tagName = interaction.options.getString("nom");
			const tagDescription = interaction.options.getString("description");

			try {
				const tag = await Tags.create({
					name: tagName,
					description: tagDescription,
					user_id: interaction.user.id
				});

				return interaction.reply({ embeds: [simpleEmbed(`Le tag \`${tag.name}\` a été créé avec succès !`)] });
			} catch (error) {
				if (error.name === "SequelizeUniqueConstraintError") return interaction.reply({ embeds: [simpleEmbed(`Le tag \`${tagName}\` existe déjà !`)], ephemeral: true });

				return interaction.reply({ embeds: [simpleEmbed(`Une erreur est survenue lors de la création du tag \`${tagName}\``)], ephemeral: true });
			}
		} else if (subcommand === "show") {
			const tagName = interaction.options.getString("nom");

			const tag = await Tags.findOne({ where: { name: tagName } });

			if (tag) {
				tag.increment("usage_count");
				return interaction.reply({ embeds: [simpleEmbed(`**${tag.get("name")}**\n\n${tag.get("description")}`)] });
			}

			return interaction.reply({ embeds: [simpleEmbed(`Le tag \`${tagName}\` n'existe pas !`)], ephemeral: true });

		} else if (subcommand === "edit") {
			const tagName = interaction.options.getString("nom");
			const tagDescription = interaction.options.getString("description");

			const tag = await Tags.findOne({ where: { name: tagName } });
			if (!tag) return interaction.reply({ embeds: [simpleEmbed(`Le tag \`${tagName}\` n'existe pas !`)], ephemeral: true });

			const tagAuthorId = tag.get("user_id");
			if (tagAuthorId !== interaction.user.id) return interaction.reply({ embeds: [simpleEmbed(`Vous n'êtes pas l'auteur du tag \`${tagName}\` !`)], ephemeral: true });

			await Tags.update({ description: tagDescription }, { where: { name: tagName } });

			return interaction.reply({ embeds: [simpleEmbed(`Le tag \`${tagName}\` a été modifié avec succès !`)] });
		} else if (subcommand === "info") {
			const tagName = interaction.options.getString("nom");

			const tag = await Tags.findOne({ where: { name: tagName } });
			if (!tag) return interaction.reply({ embeds: [simpleEmbed(`Le tag \`${tagName}\` n'existe pas !`)], ephemeral: true });

			const createdAt = tag.get("createdAt");
			const createdTimestamp = parseInt(createdAt.getTime() / 1000);

			return interaction.reply({ embeds: [simpleEmbed(
				`**Informations sur le tag \`${tagName}\`**\n
				Nom : \`${tag.get("name")}\`
				Description : \`${tag.get("description")}\`
				Auteur : <@${tag.get("user_id")}>
				Création : <t:${createdTimestamp}:F>
				Utilisations : \`${tag.get("usage_count")}\``
			)] });
		} else if (subcommand === "list") {
			const tagList = await Tags.findAll({ attributes: ["name"] });
			const tagString = tagList.map(t => `\`${t.name}\``).join(", ") || "Aucun tag créé";

			return interaction.reply({ embeds: [simpleEmbed(`**Liste des tags**\n\n${tagString}`)] });
		} else if (subcommand === "delete") {
			const tagName = interaction.options.getString("nom");

			const tag = await Tags.findOne({ where: { name: tagName } });
			if (!tag) return interaction.reply({ embeds: [simpleEmbed(`Le tag \`${tagName}\` n'existe pas !`)], ephemeral: true });

			const tagAuthorId = tag.get("user_id");
			if (tagAuthorId !== interaction.user.id) return interaction.reply({ embeds: [simpleEmbed(`Vous n'êtes pas l'auteur du tag \`${tagName}\` !`)], ephemeral: true });

			await Tags.destroy({ where: { name: tagName } });

			return interaction.reply({ embeds: [simpleEmbed(`Le tag \`${tagName}\` a été supprimé avec succès !`)] });
		}
	}
};