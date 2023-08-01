const { ActionRowBuilder, ComponentType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder } = require("discord.js");
const { clientColor } = require("../../config.json");

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Afficher la liste des commandes")
		.setDMPermission(true),
	async execute(interaction) {
		const { client } = interaction;

		function getCommandId(commandName) {
			return client.application.commands.cache.find(command => command.name === commandName).id;
		}

		function formatString(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}

		const emojis = {
			fun: "🎉",
			information: "ℹ️",
			modération: "🛠",
			utilitaire: "👍"
		};

		const commands = [];

		client.commands.forEach(command => {
			if (command.data.options.length === 0 || (!(command.data.options[0] instanceof SlashCommandSubcommandGroupBuilder) && !(command.data.options[0] instanceof SlashCommandSubcommandBuilder))) {
				return commands.push({
					type: 0,
					category: command.category,
					name: `${command.data.name}`,
					description: command.data.description,
					id: getCommandId(command.data.name)
				});
			}
			command.data.options.forEach(option => {
				if (option instanceof SlashCommandSubcommandGroupBuilder) {
					option.options.forEach(subcommand => {
						commands.push({
							type: 2,
							category: command.category,
							name: `${command.data.name} ${option.name} ${subcommand.name}`,
							description: subcommand.description,
							id: getCommandId(command.data.name)
						});
					});
				} else if (option instanceof SlashCommandSubcommandBuilder) {
					commands.push({
						type: 1,
						category: command.category,
						name: `${command.data.name} ${option.name}`,
						description: option.description,
						id: getCommandId(command.data.name)
					});
				}
			});
		});

		const categories = [...new Set(commands.map(command => command.category))];

		const embed = new EmbedBuilder()
			.setColor(clientColor)
			.setTitle("Liste des commandes")
			.setDescription("Veuillez sélectionner une catégorie dans le menu déroulant.");

		const select = new StringSelectMenuBuilder()
			.setCustomId("help")
			.setPlaceholder("Veuillez sélectionner une catégorie")
			.addOptions(
				categories.map(category => new StringSelectMenuOptionBuilder()
					.setEmoji(emojis[category])
					.setLabel(formatString(category))
					.setValue(category)
					.setDescription(`Commandes de la catégorie ${formatString(category)}`)
				)
			);

		const row = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

		const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 300_000 });

		collector.on("collect", async i => {
			const category = i.values[0];
			const categoryCommands = commands.filter(command => command.category === category);

			const categoryEmbed = new EmbedBuilder()
				.setColor(clientColor)
				.setTitle(`Commandes de la catégorie \`${formatString(category)}\``)
				.setDescription(
					[...new Set(categoryCommands.map(command => command.name.split(" ")[0]))].map(commandName =>
						`**${formatString(commandName)}**
						${categoryCommands.filter(command => command.name.split(" ")[0] === commandName).map(command => `</${command.name}:${command.id}> : ${command.description}`).join("\n")}`
					).join("\n\n")
				);

			await i.update({ embeds: [categoryEmbed] });
		});

		collector.on("end", async () => {
			const endEmbed = new EmbedBuilder()
				.setColor(clientColor)
				.setDescription(`Le menu déroulant a expiré. Veuillez refaire la commmande </help:${getCommandId("help")}>.`);

			select.setDisabled(true);

			await response.edit({ embeds: [endEmbed], components: [row] });
		});
	}
};