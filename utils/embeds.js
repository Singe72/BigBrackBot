const { EmbedBuilder } = require("discord.js");
const { clientColor } = require("../config.json");

function simpleEmbed(description) {
	return new EmbedBuilder()
		.setColor(clientColor)
		.setDescription(description);
}

// TODO : richEmbed

function logEmbed({ color, user, description, footer }) {
	return new EmbedBuilder()
		.setColor(color)
		.setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
		.setDescription(description)
		.setFooter({ text: footer })
		.setTimestamp();
}

module.exports = { simpleEmbed, logEmbed };