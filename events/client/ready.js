const { Events } = require("discord.js");
const { addSpeechEvent } = require("discord-speech-recognition");

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		client.application.commands.fetch();
		console.log(`Ready! Logged in as ${client.user.tag}`);
		addSpeechEvent(client, {
			group: client.user.id,
			lang: "fr-FR",
			profanityFilter: false
		});
	}
};