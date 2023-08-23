const { ActivityType, ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, version } = require("discord.js");
const { avgClockMHz, totalCores, usagePercent } = require("cpu-stat");
const { simpleEmbed } = require("../../utils/embeds.js");
const { clientColor, ownerId } = require("../../config.json");

function addBadges(badgeNames) {
	if (!badgeNames.length) return ["`Aucun`"];
	const badgeMap = {
		"ActiveDeveloper": "<:activedeveloper:1109109195153879172>",
		"BugHunterLevel1": "<:discordbughunter1:1109109200136704001>",
		"BugHunterLevel2": "<:discordbughunter2:1109109202913333308>",
		"PremiumEarlySupporter": "<:discordearlysupporter:1109109204150648862>",
		"Partner": "<:discordpartner:1109109230415384657>",
		"Staff": "<:discordstaff:1109109232785166458>",
		"HypeSquadOnlineHouse1": "<:hypesquadbravery:1109109235389845544>",
		"HypeSquadOnlineHouse2": "<:hypesquadbrilliance:1109109237386330152>",
		"HypeSquadOnlineHouse3": "<:hypesquadbalance:1109109234261577758>",
		"Hypesquad": "<:hypesquadevents:1109109238732685423>",
		"CertifiedModerator": "<:discordmod:1109109206184886292>",
		"VerifiedDeveloper": "<:discordbotdev:1109109199058763848>"
	};

	return badgeNames.map(badgeName => badgeMap[badgeName] || "❔");
}

function formatBytes(a, b) {
	const c = 1024;
	const d = b || 2;
	const e = ["B", "KB", "MB", "GB", "TB"];
	const f = Math.floor(Math.log(a) / Math.log(c));

	return parseFloat((a / Math.pow(c, f)).toFixed(d)) + "" + e[f];
}

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("info")
		.setDescription("Afficher les informations du bot, du serveur ou d'un utilisateur")
		.addSubcommand(subcommand =>
			subcommand.setName("bot")
				.setDescription("Afficher les informations du bot")
		)
		.addSubcommand(subcommand =>
			subcommand.setName("server")
				.setDescription("Afficher les informations du serveur")
		)
		.addSubcommand(subcommand =>
			subcommand.setName("user")
				.setDescription("Afficher les informations d'un utilisateur")
				.addUserOption(option =>
					option.setName("membre")
						.setDescription("Membre à afficher")
						.setRequired(false)
				)
		)
		.setDMPermission(false),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case "bot": {
				usagePercent(async (error, percent) => {
					if (error) {
						console.error(error);
						return interaction.reply({ embeds: [simpleEmbed("Une erreur est survenue lors de l'exécution de la commande.")], ephemeral: true });
					}

					const { client } = interaction;
					const { user } = client;

					const createdTimestamp = Math.round(client.user.createdTimestamp / 1000);
					const days = Math.floor(client.uptime / 86400000);
					const hours = Math.floor(client.uptime / 3600000) % 24;
					const minutes = Math.floor(client.uptime / 60000) % 60;
					const seconds = Math.floor(client.uptime / 1000) % 60;
					const roles = interaction.guild.members.me.roles.cache
						.filter(role => role.id !== interaction.guild.id)
						.sort((a, b) => b.position - a.position)
						.map(role => role);
					const badges = user.flags.toArray();

					const cores = totalCores();
					const clockMHz = avgClockMHz();
					const memoryUsage = formatBytes(process.memoryUsage().heapUsed);
					const cpu = percent.toFixed(2);

					const embed = new EmbedBuilder()
						.setColor(clientColor)
						.setTitle("Informations du bot")
						.setThumbnail(user.displayAvatarURL({ dynamic: true }))
						.addFields(
							{
								name: "Informations générales",
								value: `
								> **Nom** : ${user}
								> **Tag** : \`${user.tag}\`
								> **ID** : \`${user.id}\`
								> **Date de création** : <t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)
								> **Rôles** : ${roles.join(" ")}
								> **Badges** : ${addBadges(badges).join("")}
								> **Commandes** : \`${client.commands.size}\`
								> **Développeur** : <@${ownerId}>
								`
							},
							{
								name: "Informations techniques",
								value: `
								> **Ping** : \`${client.ws.ping}ms\`
								> **Uptime** : \`${days}j ${hours}h ${minutes}m ${seconds}s\`
								> **Version Discord** : \`${version}\`
								> **Version Node** : \`${process.version}\`
								> **CPU** : \`${cpu}%\`
								> **Coeurs** : \`${cores}\`
								> **Fréquence** : \`${clockMHz}MHz\`
								> **Mémoire** : \`${memoryUsage}\`
								`
							},
							{
								name: "Autres informations",
								value: `
								> **A2F** : \`${user.mfaEnabled ? "🟢" : "🔴"}\`
								> **Partial** : \`${user.partial ? "🟢" : "🔴"}\`
								> **Officiel** : \`${user.system ? "🟢" : "🔴"}\`
								> **Vérifié** : \`${user.verified ? "🟢" : "🔴"}\`
								`
							}
						);

					await interaction.reply({ embeds: [embed] });
				});
				break;
			}

			case "server": {
				const { guild } = interaction;

				const createdTimestamp = Math.round(guild.createdTimestamp / 1000);

				const embed = new EmbedBuilder()
					.setColor(clientColor)
					.setTitle("Informations du serveur")
					.setThumbnail(guild.iconURL({ dynamic: true }))
					.addFields(
						{
							name: "Informations générales",
							value: `
							> **Nom** : \`${guild.name}\`
							> **Description** : \`${guild.description ?? "Aucune"}\`
							> **ID** : \`${guild.id}\`
							> **Date de création** : <t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)
							> **Propriétaire** : <@${guild.ownerId}>
							`
						},
						{
							name: "Statistiques",
							value: `
							> **Membres** : \`${guild.memberCount} / ${guild.maximumMembers}\`
							> **Niveau de boost** : \`${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)\`
							> **Catégories** : \`${guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size}\`
							> **Salons textuels** : \`${guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size}\`
							> **Salons vocaux** : \`${guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size}\`
							> **Rôles** : \`${guild.roles.cache.size}\`
							> **Emojis** : \`${guild.emojis.cache.size}\`
							> **Stickers** : \`${guild.stickers.cache.size}\`
							`
						},
						{
							name: "Salons spéciaux",
							value: `
							> **AFK** : ${guild.afkChannel ? `${guild.afkChannel}` : "`Aucun`"}
							> **Règlement** : ${guild.rulesChannel ? guild.rulesChannel : "`Aucun`"}
							> **Système** : ${guild.systemChannel ? guild.systemChannel : "`Aucun`"}
							`
						}
					)
					.setImage((await guild.fetch()).bannerURL({ dynamic: true, size: 4096 }));

				await interaction.reply({ embeds: [embed] });
				break;
			}

			case "user": {
				const user = interaction.options.getUser("membre") || interaction.user;
				let member = interaction.options.getMember("membre");

				if (user && !member) {
					try {
						member = await interaction.guild.members.fetch(user.id);
					} catch (error) {
						member = null;
					}
				}

				if (!user) return interaction.reply({ embeds: [simpleEmbed("Ce membre n'existe pas !")], ephemeral: true });
				if (!member) return interaction.reply({ embeds: [simpleEmbed(`<@${user.id}> n'est pas membre du serveur !`)], ephemeral: true });

				const createdTimestamp = Math.round(user.createdTimestamp / 1000);
				const joinedTimestamp = Math.round(member.joinedTimestamp / 1000);
				const roles = member.roles.cache
					.filter(role => role.id !== interaction.guild.id)
					.sort((a, b) => b.position - a.position)
					.map(role => role);
				const badges = user.flags.toArray();

				const devices = [
					{ desktop: member.presence?.clientStatus.desktop ?? "offline" },
					{ mobile: member.presence?.clientStatus.mobile ?? "offline" },
					{ web: member.presence?.clientStatus.web ?? "offline" }
				];

				const emojiMappings = {
					online: {
						desktop: "<:onlinedesktop:1109285036139761805>",
						mobile: "<:onlinemobile:1109285038589227030>",
						web: "<:onlineweb:1109285044704518259>"
					},
					idle: {
						desktop: "<:idledesktop:1109284995782160484>",
						mobile: "<:idlemobile:1109284998219051038>",
						web: "<:idleweb:1109284999645106316>"
					},
					dnd: {
						desktop: "<:dnddesktop:1109284990728020060>",
						mobile: "<:dndmobile:1109284992925839480>",
						web: "<:dndweb:1109284994318344242>"
					},
					offline: {
						desktop: "<:offlinedesktop:1109285002811818086>",
						mobile: "<:offlinemobile:1109285032134201455>",
						web: "<:offlineweb:1109285034386522142>"
					}
				};

				let presences = "";
				devices.forEach(device => {
					const [deviceType, status] = Object.entries(device)[0];
					const emoji = emojiMappings[status]?.[deviceType] ?? "Emoji Inconnu";
					presences += `${emoji} `;
				});

				const embed = new EmbedBuilder()
					.setColor(clientColor)
					.setTitle("Informations du membre")
					.setThumbnail(member.displayAvatarURL({ dynamic: true }))
					.addFields(
						{
							name: "Informations sur l'utilisateur",
							value: `
							> **Nom d'affichage** : \`${user.displayName}\`
							> **Nom d'utilisateur** : \`${user.username}\`
							> **ID** : \`${user.id}\`
							> **Date de création** : <t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)
							> **Bot** : \`${user.bot ? "🟢" : user.id === ownerId ? "🟢" : "🔴" }\`
							> **Badges** : ${addBadges(badges).join("")}
							> **Présences** : ${presences}
							> **Statut personnalisé** : \`${member.presence?.activities.find(a => a.type === ActivityType.Custom)?.state ?? "Aucun"}\`
							`
						},
						{
							name: "Informations sur le membre",
							value: `
							> **Pseudo** : ${member}
							> **Date d'arrivée** : <t:${joinedTimestamp}:F> (<t:${joinedTimestamp}:R>)
							> **Rôles** : ${roles.join(" ")}
							> **Exclu** : \`${member.isCommunicationDisabled() ? "🟢" : "🔴"}\`
							> **Booster** : \`${member.premiumSince ? "🟢" : "🔴"}\`
							> **Administrateur** : \`${member.permissions.has(PermissionFlagsBits.Administrator) ? "🟢" : "🔴"}\`
							`
						}
					)
					.setImage((await user.fetch()).bannerURL({ dynamic: true, size: 4096 }));

				await interaction.reply({ embeds: [embed] });
				break;
			}
		}
	}
};