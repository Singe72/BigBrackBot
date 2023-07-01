const { GiveawaysManager } = require("discord-giveaways");
const { clientColor } = require("../config.json");

module.exports = (client) => {
	client.giveawaysManager = new GiveawaysManager(client, {
		storage: "./giveaways.json",
		default: {
			botsCanWin: false,
			embedColor: clientColor,
			embedColorEnd: clientColor,
			reaction: "🎉",
			lastChance: {
				enabled: true,
				content: "⚠️ **Dernière chance pour participer !** ⚠️",
				threshold: 10_000,
				embedColor: clientColor
			}
		}
	});
};