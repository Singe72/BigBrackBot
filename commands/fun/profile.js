const { AttachmentBuilder, SlashCommandBuilder } = require("discord.js");
const { profileImage } = require("discord-arts");

module.exports = {
	cooldown: 5,
	category: "fun",
	data: new SlashCommandBuilder()
		.setName("profile")
		.setDescription("Gérer son profil et afficher celui des autres membres")
		.addSubcommand(subcommand =>
			subcommand.setName("show")
				.setDescription("Afficher le profil d'un membre")
				.addUserOption(option =>
					option.setName("membre")
						.setDescription("Membre dont afficher le profil")
						.setRequired(false)
				)
		)
		.setDMPermission(true),
	async execute(interaction) {
		await interaction.deferReply();

		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "show") {
			try {
				const member = interaction.options.getMember("membre") ?? interaction.member;
				const profileBuffer = await profileImage(member.id);
				const imageAttachment = new AttachmentBuilder(profileBuffer, { name: "profile.png" });
				await interaction.editReply({ files: [imageAttachment] });
			} catch (error) {
				console.error(error);
				await interaction.editReply("Une erreur est survenue lors de la génération de votre profil.");
			}
		}
	}
};