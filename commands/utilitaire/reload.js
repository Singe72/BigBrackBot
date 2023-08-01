const { SlashCommandBuilder } = require("discord.js");
const { simpleEmbed } = require("../../utils/embeds.js");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("reload")
		.setDescription("Recharger une commande")
		.addStringOption(option =>
			option.setName("commande")
				.setDescription("Commande à recharger")
				.setRequired(true)),
	async execute(interaction) {
		const commandName = interaction.options.getString("commande");
		const command = interaction.client.commands.get(commandName);

		if (!command) return interaction.reply({ embeds: [simpleEmbed(`La commande \`${commandName}\` n'existe pas !`)], ephemeral: true });

		delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];

		try {
			interaction.client.commands.delete(command.data.name);
			const newCommand = require(`../${command.category}/${command.data.name}.js`);
			const properties = { category:command.category, ...command };
			interaction.client.commands.set(newCommand.data.name, properties);
			await interaction.reply({ embeds:[simpleEmbed(`La commande \`${newCommand.data.name}\` a été rechargée !`)], ephemeral: true });
		} catch (error) {
			console.error(error);
			await interaction.reply({ embeds:[simpleEmbed(`Une erreur est survenue lors du rechargement de la commande \`${command.data.name}\`:\n\`${error.message}\``)], ephemeral: true });
		}
	}
};