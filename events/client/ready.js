const { Events } = require("discord.js");
//const createNasaJob = require("../../cron/nasa");

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		client.application.commands.fetch();
		console.log(`Ready! Logged in as ${client.user.tag}`);
		
		//const nasaJob = createNasaJob(client);
		//nasaJob.start();
		//console.log("NASA job started");
	}
};
