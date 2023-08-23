const { SlashCommandBuilder } = require("discord.js");
const { simpleEmbed } = require("../../utils/embeds.js");
const AutoComplete = require("youtube-autocomplete");
const { Client } = require("genius-lyrics");
const { genius: token } = require("../../config.json");

function addSource(source) {
	const sources = {
		deezer: "<:deezer:1125458567567249579>",
		spotify: "<:spotify:1125458571249844276>",
		soundcloud: "<:soundcloud:1125458564673187960>",
		youtube: "<:youtube:1125458568947171469>"
	};
	return sources[source] ?? "";
}

module.exports = {
	cooldown: 0,
	data: new SlashCommandBuilder()
		.setName("music")
		.setDescription("Gérer la musique")
		.addSubcommand(subcommand =>
			subcommand.setName("play")
				.setDescription("Jouer une musique")
				.addStringOption(option =>
					option.setName("musique")
						.setDescription("Nom de la musique")
						.setRequired(true)
						.setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand.setName("pause")
				.setDescription("Mettre en pause la musique"))
		.addSubcommand(subcommand =>
			subcommand.setName("resume")
				.setDescription("Reprendre la musique"))
		.addSubcommand(subcommand =>
			subcommand.setName("seek")
				.setDescription("Aller à un moment précis de la musique")
				.addIntegerOption(option =>
					option.setName("temps")
						.setDescription("Temps en secondes")
						.setMinValue(0)
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName("rewind")
				.setDescription("Reculer le temps de la musique")
				.addIntegerOption(option =>
					option.setName("temps")
						.setDescription("Temps en secondes")
						.setMinValue(0)
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName("forward")
				.setDescription("Avancer le temps de la musique")
				.addIntegerOption(option =>
					option.setName("temps")
						.setDescription("Temps en secondes")
						.setMinValue(0)
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName("previous")
				.setDescription("Jouer la musique précédente"))
		.addSubcommand(subcommand =>
			subcommand.setName("skip")
				.setDescription("Passer la musique"))
		.addSubcommand(subcommand =>
			subcommand.setName("jump")
				.setDescription("Passer à la musique spécifiée")
				.addIntegerOption(option =>
					option.setName("numéro")
						.setDescription("Numéro de la musique")
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName("stop")
				.setDescription("Arrêter la musique"))
		.addSubcommand(subcommand =>
			subcommand.setName("shuffle")
				.setDescription("Mélanger la file d'attente"))
		.addSubcommand(subcommand =>
			subcommand.setName("autoplay")
				.setDescription("Activer ou désactiver l'autoplay"))
		.addSubcommand(subcommand =>
			subcommand.setName("queue")
				.setDescription("Afficher la file d'attente"))
		.addSubcommand(subcommand =>
			subcommand.setName("join")
				.setDescription("Demander au bot de rejoindre le salon vocal"))
		.addSubcommand(subcommand =>
			subcommand.setName("leave")
				.setDescription("Demander au bot de quitter le salon vocal"))
		.addSubcommandGroup(subcommandGroup =>
			subcommandGroup.setName("filters")
				.setDescription("Gérer les filtres")
				.addSubcommand(subcommand =>
					subcommand.setName("toggle")
						.setDescription("Activer ou désactiver un filtre")
						.addStringOption(option =>
							option.setName("filtre")
								.setDescription("Nom du filtre")
								.setRequired(true)
								.addChoices(
									{ name: "3d", value: "3d" },
									{ name: "bassboost", value: "bassboost" },
									{ name: "echo", value: "echo" },
									{ name: "karaoke", value: "karaoke" },
									{ name: "nightcore", value: "nightcore" },
									{ name: "vaporwave", value: "vaporwave" },
									{ name: "flanger", value: "flanger" },
									{ name: "gate", value: "gate" },
									{ name: "haas", value: "haas" },
									{ name: "reverse", value: "reverse" },
									{ name: "surround", value: "surround" },
									{ name: "mcompand", value: "mcompand" },
									{ name: "phaser", value: "phaser" },
									{ name: "tremolo", value: "tremolo" },
									{ name: "earwax", value: "earwax" }
								)))
				.addSubcommand(subcommand =>
					subcommand.setName("reset")
						.setDescription("Réinitialiser les filtres")))
		.addSubcommand(subcommand =>
			subcommand.setName("lyrics")
				.setDescription("Afficher les paroles d'une musique")
				.addStringOption(option =>
					option.setName("musique")
						.setDescription("Nom de la musique")
						.setRequired(false))),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		AutoComplete(focusedValue, async (err, queries) => {
			if (err) throw err;
			const choices = queries[1];
			await interaction.respond(
				choices.slice(0, 15).map(choice => ({ name: choice, value: choice }))
			);
		});
	},
	async execute(interaction) {
		const { channel, client, guild, member, options } = interaction;
		const subcommandGroup = options.getSubcommandGroup();
		const subcommand = options.getSubcommand();

		const voiceChannel = member.voice.channel;
		if (!voiceChannel) return interaction.reply({ embeds: [simpleEmbed("Vous devrez être dans un salon vocal pour utiliser cette commande !")], ephemeral: true });
		if (!voiceChannel.joinable) return interaction.reply({ embeds: [simpleEmbed(`${client.user} ne peut pas rejoindre ce salon vocal !`)], ephemeral: true });
		if (!voiceChannel.id === guild.members.me.voice.channelId) return interaction.reply({ embeds: [simpleEmbed(`Vous n'êtes pas dans le même salon vocal que ${client.user} !`)], ephemeral: true });

		if (subcommandGroup === "filters") {
			const queue = client.distube.getQueue(guild);
			if (!queue) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

			if (subcommand === "toggle") {
				const filter = options.getString("filtre");

				if (queue.filters.has(filter)) await queue.filters.remove(filter);
				else await queue.filters.add(filter);

				await interaction.reply({ embeds: [simpleEmbed(`Le filtre \`${filter}\` a été ${queue.filters.has(filter) ? "activé" : "désactivé"} !`)] });
			} else if (subcommand === "reset") {
				await queue.filters.clear();
				await interaction.reply({ embeds: [simpleEmbed("Les filtres ont été réinitialisés !")] });
			}
		}

		switch (subcommand) {
			case "play": {
				await interaction.deferReply();

				const query = options.getString("musique");
				await client.distube
					.play(voiceChannel, query, {
						textChannel: channel,
						member: member,
						metadata: { i: interaction }
					})
					.catch(error => {
						console.error(error);
						interaction.editReply({ embeds: [simpleEmbed("Une erreur est survenue lors de la lecture de la musique !")], ephemeral: true });
					});
				break;
			}

			case "pause": {
				const queue = client.distube.getQueue(guild);
				if (!queue) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });
				if (queue.paused) return interaction.reply({ embeds: [simpleEmbed("La musique est déjà en pause !")], ephemeral: true });

				await queue.pause();
				await interaction.reply({ embeds: [simpleEmbed("⏸️ La musique a été mise en pause.")] });
				break;
			}

			case "resume": {
				const queue = client.distube.getQueue(guild);
				if (!queue) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });
				if (!queue.paused) return interaction.reply({ embeds: [simpleEmbed("La musique n'est pas en pause !")], ephemeral: true });

				await queue.resume();
				await interaction.reply({ embeds: [simpleEmbed("▶️ La musique a été reprise.")] });
				break;
			}

			case "seek": {
				const queue = client.distube.getQueue(guild);
				if (!queue) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				const time = options.getInteger("temps");
				if (time > queue.songs[0].duration) return interaction.reply({ embeds: [simpleEmbed("Le temps spécifié est supérieur à la durée de la musique !")], ephemeral: true });

				await queue.seek(time);
				await interaction.reply({ embeds: [simpleEmbed(`⏩ La musique a été avancée à \`${time} secondes\`.`)] });
				break;
			}

			case "rewind": {
				const queue = client.distube.getQueue(guild);
				if (!queue) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				const time = options.getInteger("temps");
				if (queue.currentTime - time < 0) return interaction.reply({ embeds: [simpleEmbed("La musique ne peut pas être reculée d'autant de secondes !")], ephemeral: true });

				await queue.seek(queue.currentTime - time);
				await interaction.reply({ embeds: [simpleEmbed(`⏪ La musique a été reculée de \`${time} secondes\`.`)] });
				break;
			}

			case "forward": {
				const queue = client.distube.getQueue(guild);
				if (!queue) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				const time = options.getInteger("temps");
				if (queue.currentTime + time > queue.songs[0].duration) return interaction.reply({ embeds: [simpleEmbed("La musique ne peut pas être avancée d'autant de secondes !")], ephemeral: true });

				await queue.seek(queue.currentTime + time);
				await interaction.reply({ embeds: [simpleEmbed(`⏩ La musique a été avancée de \`${time} secondes\`.`)] });
				break;
			}

			case "previous": {
				const queue = client.distube.getQueue(guild);
				if (!queue) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });
				if (queue.previousSongs.length === 0) return interaction.reply({ embeds: [simpleEmbed("Il n'y a aucune musique précédente !")], ephemeral: true });

				await queue.previous();
				await interaction.reply({ embeds: [simpleEmbed("⏮️ La musique précédente est jouée.")] });
				break;
			}

			case "skip": {
				const queue = client.distube.getQueue(guild);
				if (!queue) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });
				if (queue.songs.length === 1 && !queue.autoplay) return interaction.reply({ embeds: [simpleEmbed("Il n'y a aucune musique dans la file d'attente !")], ephemeral: true });

				await queue.skip();
				await interaction.reply({ embeds: [simpleEmbed("⏭️ La musique a été passée.")] });
				break;
			}

			case "jump": {
				const queue = client.distube.getQueue(guild);
				if (!queue) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				const number = options.getInteger("numéro");
				try {
					queue.jump(number);
					await interaction.reply({ embeds: [simpleEmbed(`⏭️ La musique a été passée à la position \`${number}\`.`)] });
				} catch (error) {
					await interaction.reply({ embeds: [simpleEmbed("Le numéro de la musique est invalide !")], ephemeral: true });
				}
				break;
			}

			case "stop": {
				const queue = client.distube.getQueue(guild);
				if (!queue) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				await queue.stop();
				await interaction.reply({ embeds: [simpleEmbed("⏹️ La musique a été arrêtée.")] });
				break;
			}

			case "queue": {
				const queue = client.distube.getQueue(guild);
				if (!queue) return interaction.reply({ embeds: [simpleEmbed("La file d'attente est vide.")] });
				await interaction.reply({
					embeds: [simpleEmbed(
						`**Joue actuellement** [\`${queue.songs[0].name}\`](${queue.songs[0].url}) - \`${queue.songs[0].formattedDuration}\`
					${queue.songs.length <= 1 ? "\nLa file d'attente est vide." : `
					**__File d'attente__** (${queue.songs.length - 1})
					${queue.songs.slice(1, 11).map((song, id) => `${addSource(song.source)} **${id + 1}**. [\`${song.name}\`](${song.url}) - \`${song.formattedDuration}\``).join("\n")}

					${queue.songs.length > 11 ? `Et ${queue.songs.length - 11} autre${queue.songs.length - 11 > 1 ? "s" : ""}...` : ""}`}
				`)]
				});
				break;
			}

			case "shuffle": {
				const queue = client.distube.getQueue(guild);
				if (!queue) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				await queue.shuffle();
				await interaction.reply({ embeds: [simpleEmbed("🔀 La file d'attente a été mélangée.")] });
				break;
			}

			case "autoplay": {
				const queue = client.distube.getQueue(guild);
				if (!queue) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				await queue.toggleAutoplay();
				await interaction.reply({ embeds: [simpleEmbed(`▶️ Le mode autoplay a été \`${queue.autoplay ? "activé" : "désactivé"}\`.`)] });
				break;
			}

			case "join": {
				if (voiceChannel.id === guild.members.me.voice.channelId) return interaction.reply({ embeds: [simpleEmbed(`${client.user} est déjà dans ce salon vocal !`)], ephemeral: true });

				await client.distube.voices.join(voiceChannel);
				await interaction.reply({ embeds: [simpleEmbed(`${client.user} a rejoint le salon ${voiceChannel}.`)] });
				break;
			}

			case "leave": {
				if (voiceChannel.id !== guild.members.me.voice.channelId) return interaction.reply({ embeds: [simpleEmbed(`Vous n'êtes pas dans le même salon vocal que ${client.user} !`)], ephemeral: true });

				await client.distube.voices.leave(guild);
				await interaction.reply({ embeds: [simpleEmbed(`${client.user} a quitté le salon ${voiceChannel}.`)] });
				break;
			}

			case "lyrics": {
				await interaction.deferReply();

				const music = options.getString("musique") ?? client.distube.getQueue(guild)?.songs[0]?.name;
				if (!music) return interaction.editReply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture, et vous n'avez spécifier aucune musique valide !")], ephemeral: true });

				const geniusClient = new Client(token);
				const searches = await geniusClient.songs.search(music);
				const firstSong = searches[0];
				const lyrics = await firstSong.lyrics();

				await interaction.editReply({
					embeds: [simpleEmbed(
						`**__Paroles de ${firstSong.title}__**

					${lyrics.length > 4096 ? `${lyrics.slice(0, 4093)}...` : lyrics}
				`).setFooter({ text: "Source : Genius" })]
				});
				break;
			}
		}
	}
};