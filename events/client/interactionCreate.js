const { Collection, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const { simpleEmbed, logEmbed } = require("../../utils/embeds.js");
const { channels: { logs }, logsColors: { info } } = require("../../config.json");
const { SantaParticipants } = require("../../dbObjects.js");
const { ownerId } = require("../../config.json");

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			const { cooldowns } = interaction.client;

			if (!cooldowns.has(command.data.name)) {
				cooldowns.set(command.data.name, new Collection());
			}

			const now = Date.now();
			const timestamps = cooldowns.get(command.data.name);
			const defaultCooldownDuration = 3;
			const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

				if (now < expirationTime) {
					const expiredTimestamp = Math.round(expirationTime / 1000);
					return interaction.reply({ embeds: [simpleEmbed(`Veuillez patienter, vous êtes en cooldown pour la commande \`${command.data.name}\`.\nVous pourrez à nouveau l'utiliser <t:${expiredTimestamp}:R>.`)], ephemeral: true });
				}
			}

			timestamps.set(interaction.user.id, now);
			setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}

			const { channel, client, user } = interaction;

			try {
				const embed = logEmbed({
					color: info,
					user,
					description: `${user} a utilisé la commande \`${interaction}\` dans le salon ${channel}.`,
					footer: "Commande utilisée"
				});
				await client.channels.cache.get(logs).send({ embeds: [embed] });
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.isAutocomplete()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.isButton()) {
			switch (interaction.customId) {
				case "santa-register": {
					const santaParticipant = await SantaParticipants.findOne({ where: { user_id: interaction.user.id } });

					if (santaParticipant) return interaction.reply({ embeds: [simpleEmbed(`Vous êtes déjà inscrit au Père Noël Secret de BigBrackMar ! Si vous souhaitez vous désinscrire ou modifier vos réponses, veuillez contacter <@${ownerId}>.`)], ephemeral: true });

					const modal = new ModalBuilder()
						.setCustomId("santa-register")
						.setTitle("Père Noël Secret");

					const favoriteFoodInput = new TextInputBuilder()
						.setCustomId("favoriteFoodInput")
						.setLabel("Ton aliment préféré")
						.setStyle(TextInputStyle.Short)
						.setMinLength(3)
						.setMaxLength(100)
						.setRequired(true);

					const favoriteSubjectInput = new TextInputBuilder()
						.setCustomId("favoriteSubjectInput")
						.setLabel("Ta matière préférée à l'école")
						.setStyle(TextInputStyle.Short)
						.setMinLength(3)
						.setMaxLength(100)
						.setRequired(true);

					const favoriteMovieInput = new TextInputBuilder()
						.setCustomId("favoriteMovieInput")
						.setLabel("Ton film ou ta série préférée")
						.setStyle(TextInputStyle.Short)
						.setMinLength(3)
						.setMaxLength(100)
						.setRequired(true);

					const favoriteBrandInput = new TextInputBuilder()
						.setCustomId("favoriteBrandInput")
						.setLabel("Ta marque préférée")
						.setStyle(TextInputStyle.Short)
						.setMinLength(3)
						.setMaxLength(100)
						.setRequired(true);

					const favoriteSportInput = new TextInputBuilder()
						.setCustomId("favoriteSportInput")
						.setLabel("Ton sport préféré")
						.setStyle(TextInputStyle.Short)
						.setMinLength(3)
						.setMaxLength(100)
						.setRequired(true);

					const firstActionRow = new ActionRowBuilder().addComponents(favoriteFoodInput);
					const secondActionRow = new ActionRowBuilder().addComponents(favoriteSubjectInput);
					const thirdActionRow = new ActionRowBuilder().addComponents(favoriteMovieInput);
					const fourthActionRow = new ActionRowBuilder().addComponents(favoriteBrandInput);
					const fifthActionRow = new ActionRowBuilder().addComponents(favoriteSportInput);

					modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

					await interaction.showModal(modal);

					break;
				}

				case "santa-more-info": {
					await interaction.reply({ embeds: [simpleEmbed("Le **Père Noël Secret de BigBrackMar** est un jeu revisité. Si vous ne savez pas ce qu'est un Père Noël Secret, j'ai entendu dire qu'une petite start-up du nom de Google proposait des services de recherche de ressources en ligne.\n\nDans notre version, les **pères Noël** ne connaissent pas l'identité des personnes à qui ils doivent faire un cadeau. De même, les **destinataires** ne connaissent pas leur père Noël (c'est la définition du mot secret).\n\nHeureusement, certains **indices** présents dans le formulaire d'inscription vous aideront à **choisir le cadeau idéal** pour votre destinataire. De plus, vous aurez la possibilité de **communiquer** de manière **anonyme** avec vos interlocuteurs : **poser des questions** à votre destinataire pour lui concocter le cadeau idéal, et **répondre** à votre père Noël pour réduire les chances qu'il vous fasse un cadeau qui ne correspond pas à vos attentes.\n\nPour les cadeaux, un budget de **5 ou 10 €** sera largement suffisant. L'événement est ouvert à tous, n'hésitez pas à y participer !")], ephemeral: true });
					break;
				}

				default:
					console.error(`No button matching ${interaction.customId} was found.`);
					break;
			}
		} else if (interaction.isModalSubmit()) {
			switch (interaction.customId) {
				case "santa-register": {
					const favoriteFood = interaction.fields.getTextInputValue("favoriteFoodInput");
					const favoriteSubject = interaction.fields.getTextInputValue("favoriteSubjectInput");
					const favoriteMovie = interaction.fields.getTextInputValue("favoriteMovieInput");
					const favoriteBrand = interaction.fields.getTextInputValue("favoriteBrandInput");
					const favoriteSport = interaction.fields.getTextInputValue("favoriteSportInput");

					await SantaParticipants.create({
						user_id: interaction.user.id,
						favorite_food: favoriteFood,
						favorite_subject: favoriteSubject,
						favorite_movie: favoriteMovie,
						favorite_brand: favoriteBrand,
						favorite_sport: favoriteSport
					});

					await interaction.reply({ embeds: [simpleEmbed(`Vous êtes maintenant inscrit au Père Noël Secret de BigBrackMar !\n\n**Attention :** si vous souhaitez vous désinscrire ou modifier vos réponses, veuillez contacter <@${ownerId}>.`)], ephemeral: true });

					break;
				}
			}
		}
	}
};