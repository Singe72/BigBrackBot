const { EmbedBuilder } = require("discord.js");
const { colors } = require("../config.json");

function infoEmbed(description) {
	return new EmbedBuilder()
		.setColor(colors.info)
		.setDescription(description);
}

function successEmbed(description) {
	return new EmbedBuilder()
		.setColor(colors.success)
		.setDescription(description);
}

function errorEmbed(description) {
	return new EmbedBuilder()
		.setColor(colors.error)
		.setDescription(description);
}

function colorlessEmbed(description) {
	return new EmbedBuilder()
		.setColor(colors.colorless)
		.setDescription(description);
}

module.exports = { infoEmbed, successEmbed, errorEmbed, colorlessEmbed };