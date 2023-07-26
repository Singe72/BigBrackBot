const { codeBlock, EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { clientColor, deepl: auth_key } = require("../../config.json");
const { simpleEmbed } = require("../../utils/embeds.js");
const { Translator } = require("deepl-node");

function formatLanguage(language) {
	language = language.toUpperCase();
	switch (language) {
		case "EN":
			return "Anglais";
		case "EN-GB":
			return "Anglais (GB)";
		case "EN-US":
			return "Anglais (US)";
		case "DE":
			return "Allemand";
		case "ES":
			return "Espagnol";
		case "FR":
			return "Français";
		case "IT":
			return "Italien";
		case "NL":
			return "Néerlandais";
		case "PL":
			return "Polonais";
		case "PT":
			return "Portugais";
		case "PT-BR":
			return "Portugais (BR)";
		case "PT-PT":
			return "Portugais (PT)";
		case "RU":
			return "Russe";
		default:
			return language;
	}
}

module.exports = {
	cooldown: 5,
	category: "utilitaire",
	data: new SlashCommandBuilder()
		.setName("translate")
		.setDescription("Traduire un texte")
		.addStringOption(option =>
			option.setName("texte")
				.setDescription("Texte à traduire")
				.setMinLength(1)
				.setMaxLength(500)
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("langue")
				.setDescription("Langue de destination")
				.setRequired(true)
				.addChoices(
					{ name: "Anglais", value: "EN-GB" },
					{ name: "Allemand", value: "DE" },
					{ name: "Espagnol", value: "ES" },
					{ name: "Français", value: "FR" },
					{ name: "Italien", value: "IT" },
					{ name: "Néerlandais", value: "NL" },
					{ name: "Polonais", value: "PL" },
					{ name: "Portugais", value: "PT-PT" },
					{ name: "Russe", value: "RU" }
				)
		)
		.setDMPermission(true),
	async execute(interaction) {
		const text = interaction.options.getString("texte");
		const lang = interaction.options.getString("langue");

		await interaction.reply({ embeds: [simpleEmbed("🛠️ Traduction en cours...")] });

		const translator = new Translator(auth_key);

		translator.translateText(text, null, lang)
			.then(result => {
				const embed = new EmbedBuilder()
					.setColor(clientColor)
					.setTitle("Traduction de texte")
					.addFields(
						{ name: formatLanguage(result.detectedSourceLang), value: codeBlock(text) },
						{ name: formatLanguage(lang), value: codeBlock(result.text) }
					)
					.setFooter({ text: "Source : DeepL" });

				interaction.editReply({ embeds: [embed] });
			})
			.catch(error => {
				console.error(error);
				interaction.editReply({ embeds: [simpleEmbed("Une erreur est survenue lors de la traduction.")] });
			});
	}
};