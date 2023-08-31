const { EmbedBuilder } = require("discord.js");
const { simpleEmbed } = require("./embeds.js");
const { clientColor } = require("../config.json");

module.exports = (client) => {
	const status = queue =>
		`Volume : \`${queue.volume}%\` | Filtre : \`${queue.filters.names.join(", ") || "Off"}\` | Loop : \`${queue.repeatMode ? (queue.repeatMode === 2 ? "File d'attente" : "Musique") : "Off"
		}\` | Autoplay : \`${queue.autoplay ? "🟢" : "🔴"}\``;
	client.distube
		.on("initQueue", queue => {
			queue.voice.setSelfDeaf(false);
			queue.autoplay = false;
			queue.volume = 100;
		})
		.on("playSong", async (queue, song) => {
			const embed = simpleEmbed(`
				Joue [\`${song.name}\`](${song.url}) - \`${song.formattedDuration}\`
				Demandé par ${song.user}
				${status(queue)}
			`);
			await queue.textChannel.send({ embeds: [embed] });

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
					"https://media.tenor.com/l03_S-DyCc8AAAAC/frog-dance.gif"
				];

				const danceEmbed = new EmbedBuilder()
					.setColor(clientColor)
					.setImage(dances[Math.floor(Math.random() * dances.length)]);

				await queue.textChannel.send({ embeds: [danceEmbed] });
			}
		})
		.on("addSong", async (queue, song) => {
			await song.metadata.i.followUp({ embeds: [simpleEmbed(`[\`${song.name}\`](${song.url}) - \`${song.formattedDuration}\` a été ajouté à la file d'attente.`)] });
		})
		.on("addList", async (queue, playlist) => {
			await playlist.metadata.i.followUp({ embeds: [simpleEmbed(`La playlist [\`${playlist.name}\`](${playlist.url}) (${playlist.songs.length}) a été ajoutée à la file d'attente.`)] });
		})
		.on("error", (channel, e) => {
			if (channel) channel.send({ embeds: [simpleEmbed(`Une erreur est survenue : ${e.toString().slice(0, 1974)}`)] });
			else console.error(e);
		})
		.on("empty", channel => channel.send({ embeds: [simpleEmbed(`Le salon vocal est vide ! ${client.user} quitte le salon...`)] }))
		.on("searchNoResult", (message, query) =>
			message.channel.send({ embeds: [simpleEmbed(`Aucun résultat trouvé pour \`${query}\` !`)] })
		)
		.on("finish", queue => queue.textChannel.send({ embeds: [simpleEmbed("Terminé ! La file d'attente est vide.")] }));
};