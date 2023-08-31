const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { simpleEmbed } = require("../../utils/embeds");
const { clientColor } = require("../../config.json");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("poll")
		.setDescription("Créer un sondage")
		.addStringOption(option =>
			option.setName("question")
				.setDescription("Question du sondage")
				.setMinLength(1)
				.setMaxLength(256)
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("choix_1")
				.setDescription("Premier choix du sondage")
				.setMinLength(1)
				.setMaxLength(100)
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("choix_2")
				.setDescription("Deuxième choix du sondage")
				.setMinLength(1)
				.setMaxLength(100)
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName("choix_3")
				.setDescription("Troisième choix du sondage")
				.setMinLength(1)
				.setMaxLength(100)
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName("choix_4")
				.setDescription("Quatrième choix du sondage")
				.setMinLength(1)
				.setMaxLength(100)
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName("choix_5")
				.setDescription("Cinquième choix du sondage")
				.setMinLength(1)
				.setMaxLength(100)
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName("choix_6")
				.setDescription("Sixième choix du sondage")
				.setMinLength(1)
				.setMaxLength(100)
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName("choix_7")
				.setDescription("Septième choix du sondage")
				.setMinLength(1)
				.setMaxLength(100)
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName("choix_8")
				.setDescription("Huitième choix du sondage")
				.setMinLength(1)
				.setMaxLength(100)
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName("choix_9")
				.setDescription("Neuvième choix du sondage")
				.setMinLength(1)
				.setMaxLength(100)
				.setRequired(false)
		)
		.addStringOption(option =>
			option.setName("choix_10")
				.setDescription("Dixième choix du sondage")
				.setMinLength(1)
				.setMaxLength(100)
				.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.setDMPermission(false),
	async execute(interaction) {
		const { channel, options } = interaction;

		const question = options.getString("question");
		const choices = [
			options.getString("choix_1"),
			options.getString("choix_2"),
			options.getString("choix_3"),
			options.getString("choix_4"),
			options.getString("choix_5"),
			options.getString("choix_6"),
			options.getString("choix_7"),
			options.getString("choix_8"),
			options.getString("choix_9"),
			options.getString("choix_10")
		];
		const filteredChoices = choices.filter(choice => choice !== null);

		const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

		const embed = new EmbedBuilder()
			.setColor(clientColor)
			.setTitle(question)
			.setDescription(filteredChoices.map((choice, index) => `${emojis[index]} ${choice}`).join("\n\n"));

		await interaction.reply({ embeds: [simpleEmbed("Le sondage a été créé avec succès !")], ephemeral: true });

		const poll = await channel.send({ embeds: [embed] });

		filteredChoices.forEach(async (_, index) => await poll.react(emojis[index]));
	}
};