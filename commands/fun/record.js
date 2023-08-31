const { SlashCommandBuilder } = require("discord.js");
const { VoiceRecorder } = require("@kirdock/discordjs-voice-recorder");
const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
const { simpleEmbed } = require("../../utils/embeds.js");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("record")
		.setDescription("Gérer l'enregistrement audio du salon vocal")
		.addSubcommand(subcommand =>
			subcommand.setName("start")
				.setDescription("Démarrer l'enregistrement audio du salon vocal")
		)
		.addSubcommand(subcommand =>
			subcommand.setName("stop")
				.setDescription("Arrêter l'enregistrement audio du salon vocal")
		)
		.addSubcommand(subcommand =>
			subcommand.setName("save")
				.setDescription("Sauvegarder l'enregistrement audio du salon vocal")
				.addIntegerOption(option =>
					option.setName("temps")
						.setDescription("Temps en minutes de l'enregistrement audio")
						.setMinValue(1)
						.setMaxValue(10)
						.setRequired(true)
				)
				.addStringOption(option =>
					option.setName("type")
						.setDescription("Type d'enregistrement")
						.addChoices(
							{ name: "Piste simple", value: "single" },
							{ name: "Pistes séparées", value: "separate" }
						)
						.setRequired(true)
				)
		)
		.setDMPermission(false),
	async execute(interaction) {
		const { client, guild, guildId, member } = interaction;
		const voiceChannel = member?.voice?.channel;
		if (!voiceChannel) return interaction.reply({ embeds: [simpleEmbed("Vous devez être dans un salon vocal pour utiliser cette commande !")], ephemeral: true });

		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case "start": {
				const voiceRecorder = client.voiceRecorders.get(guildId);
				if (voiceRecorder) return interaction.reply({ embeds: [simpleEmbed("L'enregistrement audio est déjà en cours !")], ephemeral: true });

				const queue = client.distube.getQueue(guildId);
				if (queue) return interaction.reply({ embeds: [simpleEmbed("Vous ne pouvez pas enregistrer un salon vocal pendant qu'une musique est en cours !")], ephemeral: true });

				const newVoiceRecorder = new VoiceRecorder();

				const connection = joinVoiceChannel({
					guildId,
					channelId: voiceChannel.id,
					adapterCreator: guild.voiceAdapterCreator,
					selfDeaf: false
				});

				newVoiceRecorder.startRecording(connection);
				client.voiceRecorders.set(guildId, newVoiceRecorder);

				await interaction.reply({ embeds: [simpleEmbed(`L'enregistrement audio a débuté dans le salon ${voiceChannel}.`)] });
				break;
			}

			case "stop": {
				const voiceRecorder = client.voiceRecorders.get(guildId);

				if (!voiceRecorder) return interaction.reply({ embeds: [simpleEmbed("Aucun enregistrement audio n'est en cours !")], ephemeral: true });

				const connection = getVoiceConnection(guildId);

				voiceRecorder.stopRecording(connection);
				client.voiceRecorders.delete(guildId);

				const queue = client.distube.getQueue(guildId);
				if (!queue) connection.destroy();

				await interaction.reply({ embeds: [simpleEmbed(`L'enregistrement audio s'est arrêté dans le salon ${voiceChannel}.`)] });
				break;
			}

			case "save": {
				const voiceRecorder = client.voiceRecorders.get(guildId);

				if (!voiceRecorder) return interaction.reply({ embeds: [simpleEmbed("Aucun enregistrement audio n'est en cours !")], ephemeral: true });

				await interaction.deferReply();

				const time = interaction.options.getInteger("temps");
				const type = interaction.options.getString("type");

				const buffer = await voiceRecorder.getRecordedVoiceAsBuffer(guildId, type, time);
				const date = new Date().toISOString();

				let fileType, fileName;
				if (type === "single") {
					fileType = "audio/mp3";
					fileName = `${date}.mp3`;
				} else if (type === "separate") {
					fileType = "application/zip";
					fileName = `${date}-toutes-les-pistes.zip`;
				}

				await interaction.editReply({
					files: [{
						attachment: buffer,
						contentType: fileType,
						name: fileName
					}]
				});
				break;
			}
		}
	}
};