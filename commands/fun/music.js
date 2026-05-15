const { SlashCommandBuilder } = require("discord.js");
const { simpleEmbed } = require("../../utils/embeds.js");
const { formatDuration, sourceEmoji } = require("../../utils/lavalinkEvents.js");
const AutoComplete = require("youtube-autocomplete");
const { Client: GeniusClient } = require("genius-lyrics");
const { genius: token } = require("../../config.json");

const BASSBOOST_EQ = [
	{ band: 0, gain: 0.6 },
	{ band: 1, gain: 0.7 },
	{ band: 2, gain: 0.8 },
	{ band: 3, gain: 0.55 },
	{ band: 4, gain: 0.25 },
];

const TOGGLEABLE_FILTERS = {
	bassboost: {
		isActive: (p) => !!p.get("filter_bassboost"),
		toggle: async (p) => {
			const active = !!p.get("filter_bassboost");
			await p.filterManager.setEQ(active ? [] : BASSBOOST_EQ);
			p.set("filter_bassboost", !active);
		},
	},
	nightcore: {
		isActive: (p) => p.filterManager.filters?.nightcore === true,
		toggle: (p) => p.filterManager.toggleNightcore(),
	},
	vaporwave: {
		isActive: (p) => p.filterManager.filters?.vaporwave === true,
		toggle: (p) => p.filterManager.toggleVaporwave(),
	},
	karaoke: {
		isActive: (p) => p.filterManager.filters?.karaoke != null,
		toggle: (p) => p.filterManager.toggleKaraoke(),
	},
	tremolo: {
		isActive: (p) => p.filterManager.filters?.tremolo === true,
		toggle: (p) => p.filterManager.toggleTremolo(),
	},
	rotation: {
		isActive: (p) => p.filterManager.filters?.rotation === true,
		toggle: (p) => p.filterManager.toggleRotation(0.2),
	},
};

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
						.setDescription("Nom de la musique ou lien (YouTube, Spotify, Deezer, SoundCloud...)")
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
									{ name: "bassboost", value: "bassboost" },
									{ name: "nightcore", value: "nightcore" },
									{ name: "vaporwave", value: "vaporwave" },
									{ name: "karaoke", value: "karaoke" },
									{ name: "tremolo", value: "tremolo" },
									{ name: "rotation (3d)", value: "rotation" }
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
			if (err) return;
			const choices = queries[1] ?? [];
			await interaction.respond(
				choices.slice(0, 15).map(choice => ({ name: choice, value: choice }))
			).catch(() => null);
		});
	},
	async execute(interaction) {
		const { channel, client, guild, member, options } = interaction;
		const subcommandGroup = options.getSubcommandGroup();
		const subcommand = options.getSubcommand();

		const voiceChannel = member.voice.channel;
		if (!voiceChannel) return interaction.reply({ embeds: [simpleEmbed("Vous devrez être dans un salon vocal pour utiliser cette commande !")], ephemeral: true });
		if (!voiceChannel.joinable) return interaction.reply({ embeds: [simpleEmbed(`${client.user} ne peut pas rejoindre ce salon vocal !`)], ephemeral: true });

		const botVoiceId = guild.members.me.voice.channelId;
		if (botVoiceId && botVoiceId !== voiceChannel.id) {
			return interaction.reply({ embeds: [simpleEmbed(`Vous n'êtes pas dans le même salon vocal que ${client.user} !`)], ephemeral: true });
		}

		const getPlayer = () => client.lavalink.getPlayer(guild.id);

		const ensurePlayer = async () => {
			let player = getPlayer();
			if (!player) {
				player = client.lavalink.createPlayer({
					guildId: guild.id,
					voiceChannelId: voiceChannel.id,
					textChannelId: channel.id,
					selfDeaf: false,
					selfMute: false,
					volume: 100,
				});
			}
			if (!player.connected) await player.connect();
			return player;
		};

		if (subcommandGroup === "filters") {
			const player = getPlayer();
			if (!player?.queue?.current) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

			if (subcommand === "toggle") {
				const filter = options.getString("filtre");
				const handler = TOGGLEABLE_FILTERS[filter];
				if (!handler) return interaction.reply({ embeds: [simpleEmbed(`Le filtre \`${filter}\` n'est pas supporté.`)], ephemeral: true });

				await handler.toggle(player);
				const nowActive = handler.isActive(player);
				return interaction.reply({ embeds: [simpleEmbed(`Le filtre \`${filter}\` a été ${nowActive ? "activé" : "désactivé"} !`)] });
			}

			if (subcommand === "reset") {
				await player.filterManager.resetFilters();
				player.set("filter_bassboost", false);
				return interaction.reply({ embeds: [simpleEmbed("Les filtres ont été réinitialisés !")] });
			}
		}

		switch (subcommand) {
			case "play": {
				await interaction.deferReply();

				const query = options.getString("musique");

				try {
					const player = await ensurePlayer();
					const result = await player.search({ query }, member.user);

					if (!result || !result.tracks?.length) {
						return interaction.editReply({ embeds: [simpleEmbed(`Aucun résultat trouvé pour \`${query}\` !`)] });
					}

					if (result.loadType === "playlist") {
						await player.queue.add(result.tracks);
						await interaction.editReply({
							embeds: [simpleEmbed(`La playlist [\`${result.playlist?.name ?? "Playlist"}\`](${result.playlist?.uri ?? query}) (${result.tracks.length}) a été ajoutée à la file d'attente.`)],
						});
					} else {
						const track = result.tracks[0];
						await player.queue.add(track);
						await interaction.editReply({
							embeds: [simpleEmbed(`[\`${track.info.title}\`](${track.info.uri}) - \`${formatDuration(track.info.duration)}\` a été ajouté à la file d'attente.`)],
						});
					}

					if (!player.playing && !player.paused) await player.play();
				} catch (error) {
					console.error(error);
					await interaction.editReply({ embeds: [simpleEmbed("Une erreur est survenue lors de la lecture de la musique !")] }).catch(() => null);
				}
				break;
			}

			case "pause": {
				const player = getPlayer();
				if (!player?.queue?.current) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });
				if (player.paused) return interaction.reply({ embeds: [simpleEmbed("La musique est déjà en pause !")], ephemeral: true });

				await player.pause();
				await interaction.reply({ embeds: [simpleEmbed("⏸️ La musique a été mise en pause.")] });
				break;
			}

			case "resume": {
				const player = getPlayer();
				if (!player?.queue?.current) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });
				if (!player.paused) return interaction.reply({ embeds: [simpleEmbed("La musique n'est pas en pause !")], ephemeral: true });

				await player.resume();
				await interaction.reply({ embeds: [simpleEmbed("▶️ La musique a été reprise.")] });
				break;
			}

			case "seek": {
				const player = getPlayer();
				if (!player?.queue?.current) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				const time = options.getInteger("temps");
				const durationMs = player.queue.current.info.duration ?? 0;
				if (time * 1000 > durationMs) return interaction.reply({ embeds: [simpleEmbed("Le temps spécifié est supérieur à la durée de la musique !")], ephemeral: true });

				await player.seek(time * 1000);
				await interaction.reply({ embeds: [simpleEmbed(`⏩ La musique a été avancée à \`${time} secondes\`.`)] });
				break;
			}

			case "rewind": {
				const player = getPlayer();
				if (!player?.queue?.current) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				const time = options.getInteger("temps");
				const newPos = (player.position ?? 0) - time * 1000;
				if (newPos < 0) return interaction.reply({ embeds: [simpleEmbed("La musique ne peut pas être reculée d'autant de secondes !")], ephemeral: true });

				await player.seek(newPos);
				await interaction.reply({ embeds: [simpleEmbed(`⏪ La musique a été reculée de \`${time} secondes\`.`)] });
				break;
			}

			case "forward": {
				const player = getPlayer();
				if (!player?.queue?.current) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				const time = options.getInteger("temps");
				const durationMs = player.queue.current.info.duration ?? 0;
				const newPos = (player.position ?? 0) + time * 1000;
				if (newPos > durationMs) return interaction.reply({ embeds: [simpleEmbed("La musique ne peut pas être avancée d'autant de secondes !")], ephemeral: true });

				await player.seek(newPos);
				await interaction.reply({ embeds: [simpleEmbed(`⏩ La musique a été avancée de \`${time} secondes\`.`)] });
				break;
			}

			case "previous": {
				const player = getPlayer();
				if (!player?.queue?.current) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				const prev = player.queue.previous?.[0];
				if (!prev) return interaction.reply({ embeds: [simpleEmbed("Il n'y a aucune musique précédente !")], ephemeral: true });

				await player.queue.add(prev, 0);
				await player.skip(0, false);
				await interaction.reply({ embeds: [simpleEmbed("⏮️ La musique précédente est jouée.")] });
				break;
			}

			case "skip": {
				const player = getPlayer();
				if (!player?.queue?.current) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });
				if (!player.queue.tracks.length && !player.get("autoplay")) return interaction.reply({ embeds: [simpleEmbed("Il n'y a aucune musique dans la file d'attente !")], ephemeral: true });

				await player.skip();
				await interaction.reply({ embeds: [simpleEmbed("⏭️ La musique a été passée.")] });
				break;
			}

			case "jump": {
				const player = getPlayer();
				if (!player?.queue?.current) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				const number = options.getInteger("numéro");
				if (number < 1 || number > player.queue.tracks.length) {
					return interaction.reply({ embeds: [simpleEmbed("Le numéro de la musique est invalide !")], ephemeral: true });
				}

				try {
					await player.skip(number);
					await interaction.reply({ embeds: [simpleEmbed(`⏭️ La musique a été passée à la position \`${number}\`.`)] });
				} catch (error) {
					console.error(error);
					await interaction.reply({ embeds: [simpleEmbed("Le numéro de la musique est invalide !")], ephemeral: true });
				}
				break;
			}

			case "stop": {
				const player = getPlayer();
				if (!player?.queue?.current) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				await player.destroy();
				await interaction.reply({ embeds: [simpleEmbed("⏹️ La musique a été arrêtée.")] });
				break;
			}

			case "queue": {
				const player = getPlayer();
				if (!player?.queue?.current) return interaction.reply({ embeds: [simpleEmbed("La file d'attente est vide.")] });

				const current = player.queue.current;
				const upcoming = player.queue.tracks;
				const remaining = upcoming.length;

				await interaction.reply({
					embeds: [simpleEmbed(
						`**Joue actuellement** [\`${current.info.title}\`](${current.info.uri}) - \`${formatDuration(current.info.duration)}\`
					${remaining === 0 ? "\nLa file d'attente est vide." : `
					**__File d'attente__** (${remaining})
					${upcoming.slice(0, 10).map((song, id) => `${sourceEmoji(song.info.sourceName)} **${id + 1}**. [\`${song.info.title}\`](${song.info.uri}) - \`${formatDuration(song.info.duration)}\``).join("\n")}

					${remaining > 10 ? `Et ${remaining - 10} autre${remaining - 10 > 1 ? "s" : ""}...` : ""}`}
				`)],
				});
				break;
			}

			case "shuffle": {
				const player = getPlayer();
				if (!player?.queue?.current) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				await player.queue.shuffle();
				await interaction.reply({ embeds: [simpleEmbed("🔀 La file d'attente a été mélangée.")] });
				break;
			}

			case "autoplay": {
				const player = getPlayer();
				if (!player?.queue?.current) return interaction.reply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture !")], ephemeral: true });

				const next = !player.get("autoplay");
				player.set("autoplay", next);
				await interaction.reply({ embeds: [simpleEmbed(`▶️ Le mode autoplay a été \`${next ? "activé" : "désactivé"}\`.`)] });
				break;
			}

			case "join": {
				if (botVoiceId === voiceChannel.id) return interaction.reply({ embeds: [simpleEmbed(`${client.user} est déjà dans ce salon vocal !`)], ephemeral: true });

				await ensurePlayer();
				await interaction.reply({ embeds: [simpleEmbed(`${client.user} a rejoint le salon ${voiceChannel}.`)] });
				break;
			}

			case "leave": {
				const player = getPlayer();
				if (!player) return interaction.reply({ embeds: [simpleEmbed(`${client.user} n'est pas dans un salon vocal !`)], ephemeral: true });
				if (player.voiceChannelId !== voiceChannel.id) return interaction.reply({ embeds: [simpleEmbed(`Vous n'êtes pas dans le même salon vocal que ${client.user} !`)], ephemeral: true });

				await player.destroy();
				await interaction.reply({ embeds: [simpleEmbed(`${client.user} a quitté le salon ${voiceChannel}.`)] });
				break;
			}

			case "lyrics": {
				await interaction.deferReply();

				const player = getPlayer();
				const music = options.getString("musique") ?? player?.queue?.current?.info?.title;
				if (!music) return interaction.editReply({ embeds: [simpleEmbed("Aucune musique n'est en cours de lecture, et vous n'avez spécifier aucune musique valide !")] });

				const geniusClient = new GeniusClient(token);
				const searches = await geniusClient.songs.search(music);
				const firstSong = searches[0];
				if (!firstSong) return interaction.editReply({ embeds: [simpleEmbed(`Aucune parole trouvée pour \`${music}\` !`)] });

				const lyrics = await firstSong.lyrics();

				await interaction.editReply({
					embeds: [simpleEmbed(
						`**__Paroles de ${firstSong.title}__**

					${lyrics.length > 4096 ? `${lyrics.slice(0, 4093)}...` : lyrics}
				`).setFooter({ text: "Source : Genius" })],
				});
				break;
			}
		}
	},
};
