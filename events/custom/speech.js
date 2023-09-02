const { SpeechEvents } = require("discord-speech-recognition");

module.exports = {
	name: SpeechEvents.speech,
	async execute(message) {
		const { channel, client, content, member } = message;

		if (!client.speechToText.has(channel.guildId)) return;
		if (!content) return;

		await channel.send(`${member.displayName} : ${content}`);
	}
};