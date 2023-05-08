const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports = async (interaction, pages, restricted = true, time = 60_000) => {

	if (!interaction) throw new Error("Veuillez spécifier un argument pour 'interaction' !");
	if (!pages) throw new Error("Veuillez spécifier un argument pour 'pages' !");
	if (!Array.isArray(pages)) throw new Error("'pages' doit être un tableau !");

	if (typeof time !== "number") throw new Error("'time' doit être un nombre !");
	if (parseInt(time) < 30_000) throw new Error("'time' doit être plus grand que 30 secondes !");

	await interaction.deferReply();

	if (pages.length === 1) {
		const page = await interaction.editReply({
			embeds: pages,
			components: [],
			fetchReply: true
		});

		return page;
	}

	const prev = new ButtonBuilder()
		.setCustomId("prev")
		.setEmoji("⬅️")
		.setStyle(ButtonStyle.Primary)
		.setDisabled(true);

	const next = new ButtonBuilder()
		.setCustomId("next")
		.setEmoji("➡️")
		.setStyle(ButtonStyle.Primary);

	const buttonRow = new ActionRowBuilder().addComponents(prev, next);
	let index = 0;

	const currentPage = await interaction.editReply({
		embeds: [pages[index]],
		components: [buttonRow],
		fetchReply: true
	});

	const collector = await currentPage.createMessageComponentCollector({
		ComponentType: ComponentType.Button
	});

	collector.on("collect", async (i) => {
		if (i.user.id !== interaction.user.id && restricted) return i.reply({ content: "Vous ne pouvez pas utiliser ces boutons !", ephemeral: true });

		await i.deferUpdate();

		if (i.customId === "prev") {
			if (index > 0) index--;
		} else if (i.customId === "next") {
			if (index < pages.length - 1) index++;
		}

		if (index === 0) prev.setDisabled(true);
		else prev.setDisabled(false);

		if (index === pages.length - 1) next.setDisabled(true);
		else next.setDisabled(false);

		await currentPage.edit({ embeds: [pages[index]], components: [buttonRow] });

		collector.resetTimer();
	});

	collector.on("end", async () => {
		await currentPage.edit({ embeds: [pages[index]], components: [] });
	});

	return currentPage;
};