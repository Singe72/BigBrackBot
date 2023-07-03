const { simpleEmbed } = require("./embeds.js");

module.exports = (client) => {
	const status = queue =>
		`Volume : \`${queue.volume}%\` | Filtre : \`${queue.filters.names.join(", ") || "Off"}\` | Loop : \`${queue.repeatMode ? (queue.repeatMode === 2 ? "File d'attente" : "Musique") : "Off"
		}\` | Autoplay : \`${queue.autoplay ? "🟢" : "🔴"}\``;
	client.distube
		.on("initQueue", queue => {
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
		})
		.on("addSong", async (queue, song) => {
			await song.metadata.i.followUp({ embeds: [simpleEmbed(`[\`${song.name}\`](${song.url}) - \`${song.formattedDuration}\` a été ajouté à la file d'attente par ${song.user}.`)] });
		})
		.on("addList", async (queue, playlist) => {
			await playlist.metadata.i.followUp({ embeds: [simpleEmbed(`La playlist [\`${playlist.name}\`](${playlist.url}) (${playlist.songs.length}) a été ajoutée à la file d'attente par ${playlist.user}.`)] });
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