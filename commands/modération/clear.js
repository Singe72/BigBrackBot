const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const { simpleEmbed } = require("../../utils/embeds.js");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("clear")
		.setDescription("Supprimer des messages")
		.addIntegerOption(option =>
			option.setName("nombre")
				.setDescription("Nombre de messages à supprimer (1-100)")
				.setMinValue(1)
				.setMaxValue(100)
				.setRequired(true)
		)
		.addUserOption(option =>
			option.setName("membre")
				.setDescription("Membre dont supprimer les messages")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.setDMPermission(false),
	async execute(interaction) {
		const { channel, options } = interaction;

		const amount = options.getInteger("nombre");
		const user = options.getUser("membre");

		const confirm = new ButtonBuilder()
			.setCustomId("confirm")
			.setLabel("Supprimer")
			.setStyle(ButtonStyle.Danger);

		const cancel = new ButtonBuilder()
			.setCustomId("cancel")
			.setLabel("Annuler")
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(confirm, cancel);

		const response = await interaction.reply({
			embeds: [simpleEmbed(`Êtes-vous sûr de vouloir supprimer ${amount} ${amount > 1 ? "messages" : "message"}${user ? ` de ${user}` : ""} du salon ${channel} ?`)],
			components: [row],
			ephemeral: true
		});

		try {
			const confirmation = await response.awaitMessageComponent({ time: 60_000 });
			if (confirmation.customId === "confirm") {
				const channelMessages = await channel.messages.fetch({ limit: amount + 1 });
				if (user) {
					let i = 0;
					const filtered = [];
					await channelMessages.filter(message => {
						if (message.author.id === user.id && amount > i) {
							filtered.push(message);
							i++;
						}
					});
					await channel.bulkDelete(filtered)
						.then(messages => response.edit({ embeds: [simpleEmbed(`${messages.size} ${messages.size > 1 ? `messages de ${user} ont été supprimés` : `message de ${user} a été supprimé`} du salon ${channel}.`)], components: [], ephemeral: true }))
						.catch(console.error);
				} else {
					await channel.bulkDelete(amount, true)
						.then(messages => response.edit({ embeds: [simpleEmbed(`${messages.size} ${messages.size > 1 ? "messages ont été supprimés" : "message a été supprimé"} du salon ${channel}.`)], components: [], ephemeral: true }))
						.catch(console.error);
				}
			} else if (confirmation.customId === "cancel") {
				await response.edit({ embeds: [simpleEmbed("La suppression des messages a été annulée.")], components: [], ephemeral: true });
			}
		} catch (error) {
			await response.edit({ embeds: [simpleEmbed("Aucune réponse reçue pendant 1 minute, la suppression des messages est annulée.")], components: [], ephemeral: true });
		}
	}
};