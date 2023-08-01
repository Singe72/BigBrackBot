const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const ms = require("ms");
const { simpleEmbed } = require("../../utils/embeds.js");
const { clientColor } = require("../../config.json");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("giveaway")
		.setDescription("Gérer les giveaways")
		.addSubcommand(subcommand =>
			subcommand.setName("start")
				.setDescription("Commencer un giveaway")
				.addStringOption(option =>
					option.setName("durée")
						.setDescription("Durée du giveaway")
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName("gagnants")
						.setDescription("Nombre de gagnants")
						.setRequired(true))
				.addStringOption(option =>
					option.setName("récompense")
						.setDescription("Récompense à gagner")
						.setRequired(true))
				.addChannelOption(option =>
					option.setName("salon")
						.setDescription("Salon où le giveaway sera affiché")
						.addChannelTypes(ChannelType.GuildText)
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand.setName("end")
				.setDescription("Terminer un giveaway")
				.addStringOption(option =>
					option.setName("id")
						.setDescription("ID du giveaway")
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName("reroll")
				.setDescription("Relancer un giveaway")
				.addStringOption(option =>
					option.setName("id")
						.setDescription("ID du giveaway")
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName("pause")
				.setDescription("Mettre en pause un giveaway")
				.addStringOption(option =>
					option.setName("id")
						.setDescription("ID du giveaway")
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName("unpause")
				.setDescription("Reprendre un giveaway mis en pause")
				.addStringOption(option =>
					option.setName("id")
						.setDescription("ID du giveaway")
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName("delete")
				.setDescription("Supprimer un giveaway")
				.addStringOption(option =>
					option.setName("id")
						.setDescription("ID du giveaway")
						.setRequired(true)))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const { client, options } = interaction;

		switch (subcommand) {
			case "start": {
				const duration = options.getString("durée");
				const winners = options.getInteger("gagnants");
				const prize = options.getString("récompense");
				const channel = options.getChannel("salon") ?? interaction.channel;

				const time = ms(duration);
				if (isNaN(time)) return interaction.reply({ embeds: [simpleEmbed("Veuillez spécifier une durée valide !")], ephemeral: true });

				client.giveawaysManager.start(channel, {
					duration: time,
					prize: prize,
					winnerCount: winners,
					hostedBy: interaction.user,
					messages: {
						giveaway: "🎉 **Nouveau giveaway** 🎉",
						giveawayEnded: "🎉 **Giveaway terminé** 🎉",
						title: "{this.prize}",
						inviteToParticipate: "Réagissez avec 🎉 pour participer !",
						winMessage: "Félicitations, {winners} ! Vous avez gagné **{this.prize}** !",
						drawing: "Tirage au sort : {timestamp}",
						dropMessage: "Soyez le premier à réagir avec 🎉 !",
						embedFooter: "{this.winnerCount} gagnant(s)",
						noWinner: "Giveaway annulé, aucune participation valide !",
						winners: "Gagnant(s) :",
						endedAt: "Terminé le",
						hostedBy: "Créé par {this.hostedBy}"
					}
				});

				await interaction.reply({ embeds: [simpleEmbed(`Le giveaway a été créé dans le salon ${channel} !`)], ephemeral: true });
				break;
			}

			case "end": {
				const id = options.getString("id");
				const giveaway = client.giveawaysManager.giveaways.find(g => g.messageId === id && g.guildId === interaction.guild.id);
				console.log(client.giveawaysManager.giveaways);
				if (!giveaway) return interaction.reply({ embeds: [simpleEmbed(`Aucun giveaway n'a été trouvé avec l'id \`${id}\` !`)], ephemeral: true });
				if (giveaway.ended) return interaction.reply({ embeds: [simpleEmbed("Ce giveaway est déjà terminé !")], ephemeral: true });

				client.giveawaysManager
					.end(giveaway.messageId)
					.then(() => interaction.reply({ embeds: [simpleEmbed("Le giveaway s'est terminé avec succès !")], ephemeral: true }))
					.catch(e => {
						console.error(e);
						return interaction.reply({ embeds: [simpleEmbed("Une erreur est survenue lors de la termination du giveaway.")], ephemeral: true });
					});

				break;
			}

			case "reroll": {
				const id = options.getString("id");
				const giveaway = client.giveawaysManager.giveaways.find(g => g.messageId === id && g.guildId === interaction.guild.id);
				if (!giveaway) return interaction.reply({ embeds: [simpleEmbed(`Aucun giveaway n'a été trouvé avec l'id \`${id}\` !`)], ephemeral: true });
				if (!giveaway.ended) return interaction.reply({ embeds: [simpleEmbed("Ce giveaway n'est pas encore terminé !")], ephemeral: true });

				client.giveawaysManager
					.reroll(giveaway.messageId, {
						messages: {
							congrat: "🎉 Nouveau(x) gagnant(s) : {winners} ! Félicitations, vous avez gagné **{this.prize}** !",
							error: "Aucune participation valide, aucun gagnant ne peut être choisi !"
						}
					})
					.then(() => interaction.reply({ embeds: [simpleEmbed("Le giveaway a été reroll avec succès !")], ephemeral: true }))
					.catch(e => {
						console.error(e);
						return interaction.reply({ embeds: [simpleEmbed("Une erreur est survenue lors du reroll du giveaway.")], ephemeral: true });
					});

				break;
			}

			case "pause": {
				const id = options.getString("id");
				const giveaway = client.giveawaysManager.giveaways.find(g => g.messageId === id && g.guildId === interaction.guild.id);
				if (!giveaway) return interaction.reply({ embeds: [simpleEmbed(`Aucun giveaway n'a été trouvé avec l'id \`${id}\` !`)], ephemeral: true });
				if (giveaway.pauseOptions.isPaused) return interaction.reply({ embeds: [simpleEmbed("Ce giveaway est déjà en pause !")], ephemeral: true });

				client.giveawaysManager
					.pause(giveaway.messageId, {
						content: "⚠️ **Le giveaway est en pause !** ⚠️",
						infiniteDurationText: "`JAMAIS`",
						embedColor: clientColor
					})
					.then(() => interaction.reply({ embeds: [simpleEmbed("Le giveaway a été mis en pause avec succès !")], ephemeral: true }))
					.catch(e => {
						console.error(e);
						return interaction.reply({ embeds: [simpleEmbed("Une erreur est survenue lors de la mise en pause du giveaway.")], ephemeral: true });
					});

				break;
			}

			case "unpause": {
				const id = options.getString("id");
				const giveaway = client.giveawaysManager.giveaways.find(g => g.messageId === id && g.guildId === interaction.guild.id);
				if (!giveaway) return interaction.reply({ embeds: [simpleEmbed(`Aucun giveaway n'a été trouvé avec l'id \`${id}\` !`)], ephemeral: true });
				if (!giveaway.pauseOptions.isPaused) return interaction.reply({ embeds: [simpleEmbed("Ce giveaway n'est pas en pause !")], ephemeral: true });

				client.giveawaysManager
					.unpause(giveaway.messageId)
					.then(() => interaction.reply({ embeds: [simpleEmbed("Le giveaway a été repris avec succès !")], ephemeral: true }))
					.catch(e => {
						console.error(e);
						return interaction.reply({ embeds: [simpleEmbed("Une erreur est survenue lors de reprise du giveaway.")], ephemeral: true });
					});

				break;
			}

			case "delete": {
				const id = options.getString("id");
				const giveaway = client.giveawaysManager.giveaways.find(g => g.messageId === id && g.guildId === interaction.guild.id);
				if (!giveaway) return interaction.reply({ embeds: [simpleEmbed(`Aucun giveaway n'a été trouvé avec l'id \`${id}\` !`)], ephemeral: true });

				client.giveawaysManager
					.delete(giveaway.messageId)
					.then(() => interaction.reply({ embeds: [simpleEmbed("Le giveaway a été supprimé avec succès !")], ephemeral: true }))
					.catch(e => {
						console.error(e);
						return interaction.reply({ embeds: [simpleEmbed("Une erreur est survenue lors de la suppression du giveaway.")], ephemeral: true });
					});

				break;
			}
		}
	}
};