const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("reload")
		.setDescription("Recharge une commande")
		.addStringOption(option =>
			option.setName("commande")
				.setDescription("Commande à recharger")
				.setRequired(true)),
	async execute(interaction) {
		const commandName = interaction.options.getString("commande");
		const command = interaction.client.commands.get(commandName);

		if (!command) return interaction.reply({ content: `La commande \`${commandName}\` n'existe pas !` });

		delete require.cache[require.resolve(`./${command.data.name}.js`)];

		try {
			interaction.client.commands.delete(command.data.name);
			const newCommand = require(`./${command.data.name}.js`);
			interaction.client.commands.set(newCommand.data.name, newCommand);
			await interaction.reply({ content: `La commande \`${newCommand.data.name}\` a été rechargée !` });
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: `Une erreur est survenue lors du rechargement de la commande \`${command.data.name}\`:\n\`${error.message}\`` });
		}
	}
};