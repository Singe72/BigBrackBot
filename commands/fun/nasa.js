const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { clientColor, nasa: api_key } = require("../../config.json");
const { simpleEmbed } = require("../../utils/embeds.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("nasa")
		.setDescription("Afficher une image de la NASA")
		.addStringOption(option =>
			option.setName("date")
				.setDescription("Date de l'image")
				.setRequired(false)
		)
		.setDMPermission(true),
	async execute(interaction) {
		const date = interaction.options.getString("date");
		let url = `https://api.nasa.gov/planetary/apod?api_key=${api_key}&concept_tags=True&thumbs=True`;

		if (date) {
			const pattern = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
			if (!pattern.test(date)) return interaction.reply({ embeds: [simpleEmbed("La date saisie doit être au format `AAAA-MM-JJ` !")], ephemeral: true });
			url += `&date=${date}`;
		}

		await fetch(url)
			.then(response => response.json())
			.then(data => {
				if (data.media_type === "image") {
					const embed = new EmbedBuilder()
						.setColor(clientColor)
						.setTitle("Image du jour de la NASA")
						.setDescription(`
							__${data.title}__ ${data.date}
							${data.copyright ? `*© ${data.copyright.replace(/\n/g, "")}*` : ""}
						`)
						.setImage(data.hdurl ? data.hdurl : data.url)
						.setFooter({ text: "Source : NASA" });

					return interaction.reply({ embeds: [embed] });
				} else if (data.media_type === "video") {
					const embed = new EmbedBuilder()
						.setColor(clientColor)
						.setTitle("Image du jour de la NASA")
						.setDescription(`
							__${data.title}__ ${data.date}
							${data.copyright ? `*© ${data.copyright}*` : ""}
						`)
						.setImage(data.thumbnail_url)
						.setFooter({ text: "Source : NASA" });

					const button = new ButtonBuilder()
						.setLabel("Voir la vidéo")
						.setURL(data.url)
						.setStyle(ButtonStyle.Link);

					const row = new ActionRowBuilder()
						.addComponents(button);

					return interaction.reply({ embeds: [embed], components: [row] });
				}
			})
			.catch(error => {
				console.error(error);
				return interaction.reply({ embeds: [simpleEmbed("Une erreur est survenue lors de l'exécution de la commande.")], ephemeral: true });
			});
	}
};