const { EmbedBuilder } = require("discord.js");
const { simpleEmbed } = require("./embeds.js");
const { clientColor } = require("../config.json");

const SOURCE_EMOJIS = {
	youtube: "<:youtube:1125458568947171469>",
	youtubemusic: "<:youtube:1125458568947171469>",
	spotify: "<:spotify:1125458571249844276>",
	deezer: "<:deezer:1125458567567249579>",
	soundcloud: "<:soundcloud:1125458564673187960>",
	applemusic: "",
	bandcamp: "",
	twitch: "",
	http: "",
};

const sourceEmoji = (source) => SOURCE_EMOJIS[source] ?? "";

const formatDuration = (ms) => {
	if (!ms || ms < 0 || !Number.isFinite(ms)) return "00:00";
	const totalSeconds = Math.floor(ms / 1000);
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;
	const pad = (n) => String(n).padStart(2, "0");
	return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

const queueStatus = (player) => {
	const repeat =
		player.repeatMode === "queue"
			? "File d'attente"
			: player.repeatMode === "track"
				? "Musique"
				: "Off";
	return `Volume : \`${player.volume}%\` | Loop : \`${repeat}\` | Autoplay : \`${player.get("autoplay") ? "🟢" : "🔴"}\``;
};

module.exports = (client) => {
	const lavalink = client.lavalink;

	lavalink.nodeManager
		.on("connect", (node) => console.log(`[Lavalink] Node "${node.id}" connecté.`))
		.on("disconnect", (node, reason) => console.warn(`[Lavalink] Node "${node.id}" déconnecté :`, reason))
		.on("error", (node, error) => console.error(`[Lavalink] Erreur node "${node.id}" :`, error));

	lavalink
		.on("trackStart", async (player, track) => {
			const channel = client.channels.cache.get(player.textChannelId);
			if (!channel) return;

			const url = track.info.uri;
			const name = track.info.title;
			const author = track.info.author ? ` — \`${track.info.author}\`` : "";
			const duration = track.info.isStream ? "🔴 Live" : formatDuration(track.info.duration);
			const requester = track.requester ? `<@${track.requester.id}>` : "Inconnu";

			const embed = simpleEmbed(`
				Joue [\`${name}\`](${url})${author} - \`${duration}\`
				Demandé par ${requester}
				${queueStatus(player)}
			`);
			await channel.send({ embeds: [embed] }).catch(() => null);

			if (Math.floor(Math.random() * 20) === 0) {
				const dances = [
					"https://media.tenor.com/fJh-W38iA3oAAAAC/dance-kid.gif",
					"https://media.tenor.com/nVsnTj_elCMAAAAC/shrek-dance.gif",
					"https://media.tenor.com/J8KeZSDe_acAAAAC/dace.gif",
					"https://media.tenor.com/2K3eAaRfAHIAAAAC/tenor.gif",
					"https://media.tenor.com/u6r8fswiki4AAAAC/dancing-minion.gif",
					"https://media.tenor.com/ACDsfEL2EEkAAAAC/dance-lisa-simpson.gif",
					"https://media.tenor.com/i3gpM_yU3fcAAAAC/unicorn-dance.gif",
					"https://media.tenor.com/382r7hxzw5YAAAAC/orange-justice-roblox.gif",
					"https://media.tenor.com/naJicZG_DlsAAAAC/rave-party.gif",
					"https://media.tenor.com/l03_S-DyCc8AAAAC/frog-dance.gif",
				];

				const danceEmbed = new EmbedBuilder()
					.setColor(clientColor)
					.setImage(dances[Math.floor(Math.random() * dances.length)]);

				await channel.send({ embeds: [danceEmbed] }).catch(() => null);
			}
		})
		.on("queueEnd", async (player) => {
			const channel = client.channels.cache.get(player.textChannelId);
			if (channel) await channel.send({ embeds: [simpleEmbed("Terminé ! La file d'attente est vide.")] }).catch(() => null);
		})
		.on("trackError", async (player, track, payload) => {
			const channel = client.channels.cache.get(player.textChannelId);
			if (channel) {
				const reason = (payload?.exception?.message ?? "Erreur inconnue").toString().slice(0, 1900);
				await channel.send({ embeds: [simpleEmbed(`Une erreur est survenue : ${reason}`)] }).catch(() => null);
			}
		})
		.on("trackStuck", async (player) => {
			const channel = client.channels.cache.get(player.textChannelId);
			if (channel) await channel.send({ embeds: [simpleEmbed("La piste est bloquée — passage à la suivante.")] }).catch(() => null);
		})
		.on("playerDestroy", (player) => {
			const channel = client.channels.cache.get(player.textChannelId);
			if (channel) channel.send({ embeds: [simpleEmbed(`Le salon vocal est vide ! ${client.user} quitte le salon...`)] }).catch(() => null);
		});
};

module.exports.formatDuration = formatDuration;
module.exports.sourceEmoji = sourceEmoji;
