const { SlashCommandBuilder } = require("discord.js");
const { addSpeechEvent } = require("discord-speech-recognition");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
const { simpleEmbed } = require("../../utils/embeds.js");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("speech-to-text")
		.setDescription("Activer ou désactiver la reconnaissance vocale dans le salon")
		.addBooleanOption(option =>
			option.setName("état")
				.setDescription("État de la reconnaissance vocale")
				.setRequired(true)
		)
		.setDMPermission(false),
	async execute(interaction) {
		const { client, guildId, member } = interaction;
		const state = interaction.options.getBoolean("état");

		const voiceChannel = member?.voice?.channel;
		if (!voiceChannel) return interaction.reply({ embeds: [simpleEmbed("Vous devez être dans un salon vocal pour utiliser cette commande !")], ephemeral: true });

		if (state) {
			if (client.speechToText.has(guildId)) return interaction.reply({ embeds: [simpleEmbed("La reconnaissance vocale est déjà activée dans ce salon !")], ephemeral: true });
			if (!client.speechToTextEvents) {
				addSpeechEvent(client, {
					group: client.user.id,
					lang: "fr-FR",
					profanityFilter: false
				});
			}

			const connection = joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: voiceChannel.guild.id,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator,
				selfDeaf: false,
				selfMute: true,
			});

			client.speechToText.set(guildId, connection);
			client.speechToTextEvents = true;
			await interaction.reply({ embeds: [simpleEmbed(`La reconnaissance vocale a été activée dans le salon ${voiceChannel}.`)] });
		} else {
			if (!client.speechToText.has(guildId)) return interaction.reply({ embeds: [simpleEmbed("La reconnaissance vocale n'est pas activée dans ce salon !")], ephemeral: true });

			const existing = client.speechToText.get(guildId) ?? getVoiceConnection(guildId);
			existing?.destroy?.();
			client.speechToText.delete(guildId);
			await interaction.reply({ embeds: [simpleEmbed(`La reconnaissance vocale a été désactivée dans le salon ${voiceChannel}.`)] });
		}
	}
};