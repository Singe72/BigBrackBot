const { ActivityType, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { simpleEmbed } = require("../../utils/embeds.js");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("bot")
		.setDescription("Gérer le bot")
		.addSubcommandGroup(subcommandGroup =>
			subcommandGroup.setName("activity")
				.setDescription("Modifier l'activité du bot")
				.addSubcommand(subcommand =>
					subcommand.setName("set")
						.setDescription("Modifier l'activité du bot")
						.addIntegerOption(option =>
							option.setName("type")
								.setDescription("Type d'activité")
								.setRequired(true)
								.addChoices(
									{ name: "Joue à", value: ActivityType.Playing },
									{ name: "Participant à", value: ActivityType.Competing },
									{ name: "Écoute", value: ActivityType.Listening },
									{ name: "Regarde", value: ActivityType.Watching },
									{ name: "Streame", value: ActivityType.Streaming },
									{ name: "Personnalisé", value: ActivityType.Custom }
								)
						)
						.addStringOption(option =>
							option.setName("activité")
								.setDescription("Activité à afficher")
								.setRequired(true)
						)
						.addStringOption(option =>
							option.setName("url")
								.setDescription("URL du stream YouTube ou Twitch")
								.setRequired(false)
						)
				)
				.addSubcommand(subcommand =>
					subcommand.setName("reset")
						.setDescription("Réinitialiser l'activité du bot")
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName("status")
				.setDescription("Modifier le statut du bot")
				.addStringOption(option =>
					option.setName("statut")
						.setDescription("Statut à afficher")
						.setRequired(true)
						.addChoices(
							{ name: "En ligne", value: "online" },
							{ name: "Inactif", value: "idle" },
							{ name: "Ne pas déranger", value: "dnd" },
							{ name: "Invisible", value: "invisible" }
						)
				)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(true),
	async execute(interaction) {
		const subcommandGroup = interaction.options.getSubcommandGroup();
		const subcommand = interaction.options.getSubcommand();

		if (subcommandGroup === "activity") {
			if (subcommand === "set") {
				const activity = interaction.options.getString("activité");
				const type = interaction.options.getInteger("type");
				const url = interaction.options.getString("url");

				if (type === ActivityType.Streaming && !url) return interaction.reply({ embeds: [simpleEmbed("Vous devez spécifier une URL de stream pour ce type d'activité !")], ephemeral: true });
				if (type !== ActivityType.Streaming && url) return interaction.reply({ embeds: [simpleEmbed("Vous ne pouvez pas spécifier d'URL pour ce type d'activité !")], ephemeral: true });

				const twitchRegex = new RegExp(/^(https?:\/\/)?(www\.)?(twitch\.tv\/)([a-zA-Z0-9_]{4,25})$/);
				const youtubeRegex = new RegExp(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/);
				if (type === ActivityType.Streaming && !twitchRegex.test(url) && !youtubeRegex.test(url)) return interaction.reply({ embeds: [simpleEmbed("Veuillez spécifier une URL valide !")], ephemeral: true });

				await interaction.client.user.setActivity(activity, { type, url });
				await interaction.reply({ embeds: [simpleEmbed("L'activité du bot a été modifiée avec succès !")], ephemeral: true });
			} else if (subcommand === "reset") {
				await interaction.client.user.setActivity(null);
				await interaction.reply({ embeds: [simpleEmbed("L'activité du bot a été réinitialisée avec succès !")], ephemeral: true });
			}
		} else if (subcommand === "status") {
			const status = interaction.options.getString("statut");

			await interaction.client.user.setStatus(status);
			await interaction.reply({ embeds: [simpleEmbed("Le statut du bot a été modifié avec succès !")], ephemeral: true });
		}
	}
};