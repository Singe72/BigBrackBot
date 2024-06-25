const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { default: Groq } = require("groq-sdk");
const { clientColor, groq: API_KEY } = require("../../config.json");

const groq = new Groq({ apiKey: API_KEY });

async function getGroqChatCompletion(prompt) {
	return groq.chat.completions.create({
		messages: [
			{
				role: "user",
				content: prompt,
			},
		],
		model: "llama3-8b-8192",
	});
}

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("llama")
		.setDescription("Poser une question à Llama")
		.addStringOption(option =>
			option.setName("prompt")
				.setDescription("Question à poser")
				.setMinLength(10)
				.setMaxLength(500)
				.setRequired(true))
		.setDMPermission(true),
	async execute(interaction) {
		await interaction.deferReply();

		const prompt = interaction.options.getString("prompt");

		const chatCompletion = await getGroqChatCompletion(prompt);
		const response = chatCompletion.choices[0].message?.content || "Je n'ai pas de réponse à cette question.";

		const embed = new EmbedBuilder()
			.setColor(clientColor)
			.setTitle("Intelligence artificielle")
			.setDescription(`### Question\n${prompt}\n### Réponse\n${response.slice(0, 4096 - prompt.length - 20)}`)
			.setFooter({ text: "Source : Meta Llama 3" });

		await interaction.editReply({ embeds: [embed] });
	}
};