const { EmbedBuilder } = require("discord.js");
const { clientColor } = require("../config.json");

function simpleEmbed(description) {
	return new EmbedBuilder()
		.setColor(clientColor)
		.setDescription(description);
}

// TODO : richEmbed

module.exports = { simpleEmbed };