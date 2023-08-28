const { AuditLogEvent, Events, time, TimestampStyles } = require("discord.js");
const { logEmbed } = require("../../utils/embeds.js");
const { channels: { logs }, logsColors: { success, danger, warning } } = require("../../config.json");

module.exports = {
	name: Events.GuildAuditLogEntryCreate,
	async execute(auditLog, guild) {
		const { action, executorId } = auditLog;
		const { client } = guild;

		const executor = await client.users.fetch(executorId);

		try {
			let embed;
			switch (action) {
				case AuditLogEvent.ApplicationCommandPermissionUpdate: {
					const { targetId } = auditLog;
					const target = await client.application.commands.fetch(targetId);

					embed = logEmbed({
						color: warning,
						user: executor,
						description: `${executor} a mis à jour les permissions de \`/${target.name}\`.`,
						footer: "Commande mise à jour"
					});

					break;
				}

				case AuditLogEvent.BotAdd: {
					const { targetId } = auditLog;
					const target = await client.users.fetch(targetId);

					embed = logEmbed({
						color: success,
						user: executor,
						description: `${executor} a ajouté ${target} au serveur.`,
						footer: "Bot ajouté"
					}).setThumbnail(target.displayAvatarURL({ dynamic: true }));

					break;
				}

				case AuditLogEvent.ChannelCreate: {
					const { targetId } = auditLog;
					const target = await client.channels.fetch(targetId);

					embed = logEmbed({
						color: success,
						user: executor,
						description: `${executor} a créé le salon ${target}.`,
						footer: "Salon créé"
					});

					break;
				}

				case AuditLogEvent.ChannelDelete: {
					const { target: { name } } = auditLog;

					embed = logEmbed({
						color: danger,
						user: executor,
						description: `${executor} a supprimé le salon \`#${name}\`.`,
						footer: "Salon supprimé"
					});

					break;
				}

				case AuditLogEvent.ChannelUpdate: {
					const { targetId } = auditLog;
					const target = await client.channels.fetch(targetId);

					embed = logEmbed({
						color: warning,
						user: executor,
						description: `${executor} a apporté des modifications au salon ${target}.`,
						footer: "Salon mis à jour"
					});

					break;
				}

				case AuditLogEvent.EmojiCreate: {
					const { targetId } = auditLog;
					const { name, url } = await guild.emojis.fetch(targetId);

					embed = logEmbed({
						color: success,
						user: executor,
						description: `${executor} a créé l'émoji \`${name}\`.`,
						footer: "Émoji créé"
					}).setThumbnail(url);

					break;
				}

				case AuditLogEvent.EmojiDelete: {
					const { target: { name, url } } = auditLog;

					embed = logEmbed({
						color: danger,
						user: executor,
						description: `${executor} a supprimé l'émoji \`${name}\`.`,
						footer: "Émoji supprimé"
					}).setThumbnail(url);

					break;
				}

				case AuditLogEvent.EmojiUpdate: {
					const { changes, target: { name, url } } = auditLog;

					embed = logEmbed({
						color: warning,
						user: executor,
						description: `${executor} a mis à jour l'émoji \`${name}\`.`,
						footer: "Émoji mis à jour"
					})
						.setThumbnail(url)
						.addFields(
							{ name: "Ancien nom", value: changes[0].old, inline: true },
							{ name: "Nouveau nom", value: changes[0].new, inline: true }
						);

					break;
				}

				case AuditLogEvent.GuildScheduledEventCreate: {
					const { targetId } = auditLog;
					const { channelId, name, description, scheduledStartAt, scheduledEndAt, entityMetadata, image, url } = await guild.scheduledEvents.fetch(targetId);

					const location = channelId ? await client.channels.fetch(channelId) : entityMetadata.location;
					const start = time(scheduledStartAt, TimestampStyles.RelativeTime);
					const end = scheduledEndAt ? time(scheduledEndAt, TimestampStyles.RelativeTime) : "Indéfinie";

					embed = logEmbed({
						color: success,
						user: executor,
						description: `${executor} a programmé l'événement \`${name}\`.`,
						footer: "Événement créé"
					})
						.addFields(
							{ name: "Description", value: description },
							{ name: "URL", value: url },
							{ name: "Lieu", value: `${location}`, inline: true },
							{ name: "Début", value: start, inline: true },
							{ name: "Fin", value: end, inline: true }
						)
						.setImage(image ? `https://cdn.discordapp.com/guild-events/${targetId}/${image}?size=2048` : null);

					break;
				}

				case AuditLogEvent.GuildScheduledEventDelete: {
					const { target: { name } } = auditLog;

					embed = logEmbed({
						color: danger,
						user: executor,
						description: `${executor} a annulé l'événement programmé \`${name}\`.`,
						footer: "Événement annulé"
					});

					break;
				}

				case AuditLogEvent.GuildScheduledEventUpdate: {
					const { target: { name } } = auditLog;

					embed = logEmbed({
						color: warning,
						user: executor,
						description: `${executor} a mis à jour l'événement programmé \`${name}\`.`,
						footer: "Événement modifié"
					});

					break;
				}

				case AuditLogEvent.GuildUpdate: {
					embed = logEmbed({
						color: warning,
						user: executor,
						description: `${executor} a apporté des modifications à \`${guild}\`.`,
						footer: "Serveur modifié"
					});

					break;
				}

				case AuditLogEvent.InviteCreate: {
					const { target: { code, channelId, maxAge, maxUses, temporary } } = auditLog;
					const channel = await client.channels.fetch(channelId);

					const expireAfter = maxAge === 0 ? "Jamais" : `<t:${Math.floor(Date.now() / 1000) + maxAge}:R>`;

					embed = logEmbed({
						color: success,
						user: executor,
						description: `${executor} a créé une invitation \`${code}\`.`,
						footer: "Invitation créée"
					}).addFields(
						{ name: "Salon", value: `${channel}`, inline: true },
						{ name: "Utilisations", value: maxUses === 0 ? "Illimité" : `${maxUses}`, inline: true },
						{ name: "Expiration", value: expireAfter, inline: true },
						{ name: "Membre temporaire", value: temporary ? "Activé" : "Désactivé", inline: true }
					);

					break;
				}

				case AuditLogEvent.InviteDelete: {
					const { target: { code } } = auditLog;

					embed = logEmbed({
						color: danger,
						user: executor,
						description: `${executor} a supprimé une invitation \`${code}\`.`,
						footer: "Invitation supprimée"
					});

					break;
				}

				case AuditLogEvent.MemberBanAdd: {
					const { targetId, reason } = auditLog;
					const target = await client.users.fetch(targetId);

					embed = logEmbed({
						color: danger,
						user: executor,
						description: `${executor} a banni ${target}.`,
						footer: "Membre banni"
					})
						.setThumbnail(target.displayAvatarURL({ dynamic: true }))
						.addFields(
							{ name: "Raison", value: reason ?? "Aucune raison spécifiée" }
						);

					break;
				}

				case AuditLogEvent.MemberBanRemove: {
					const { targetId, reason } = auditLog;
					const target = await client.users.fetch(targetId);

					embed = logEmbed({
						color: success,
						user: executor,
						description: `${executor} a débanni ${target}.`,
						footer: "Membre débanni"
					})
						.setThumbnail(target.displayAvatarURL({ dynamic: true }))
						.addFields(
							{ name: "Raison", value: reason ?? "Aucune raison spécifiée" }
						);

					break;
				}

				case AuditLogEvent.MemberDisconnect: {
					const { extra: { count } } = auditLog;

					embed = logEmbed({
						color: danger,
						user: executor,
						description: `${executor} a déconnecté ${count} ${count > 1 ? "membres" : "membre"} du salon vocal.`,
						footer: count > 1 ? "Membres déconnectés" : "Membre déconnecté"
					});

					break;
				}

				case AuditLogEvent.MemberKick: {
					const { targetId, reason } = auditLog;
					const target = await client.users.fetch(targetId);

					embed = logEmbed({
						color: danger,
						user: executor,
						description: `${executor} a expulsé ${target}.`,
						footer: "Membre expulsé"
					})
						.setThumbnail(target.displayAvatarURL({ dynamic: true }))
						.addFields(
							{ name: "Raison", value: reason ?? "Aucune raison spécifiée" }
						);

					break;
				}

				case AuditLogEvent.MemberMove: {
					const { extra: { channel, count } } = auditLog;

					embed = logEmbed({
						color: warning,
						user: executor,
						description: `${executor} a déplacé ${count} ${count > 1 ? "membres" : "membre"} vers le salon ${channel}.`,
						footer: count > 1 ? "Membres déplacés" : "Membre déplacé"
					});

					break;
				}

				case AuditLogEvent.MessageDelete: {
					const { extra: { channel }, targetId } = auditLog;
					const target = await client.users.fetch(targetId);

					embed = logEmbed({
						color: danger,
						user: executor,
						description: `${executor} a supprimé un message de ${target} dans le salon ${channel}.`,
						footer: "Message supprimé"
					});

					break;
				}

				case AuditLogEvent.MessagePin: {
					const { extra: { channel, messageId }, targetId } = auditLog;
					const target = await client.users.fetch(targetId);
					const message = await channel.messages.fetch(messageId);

					embed = logEmbed({
						color: success,
						user: executor,
						description: `${executor} a épinglé un [message](${message.url}) de ${target} dans le salon ${channel}.`,
						footer: "Message épinglé"
					}).addFields(
						{ name: "Message", value: message.content }
					);

					break;
				}

				case AuditLogEvent.MessageUnpin: {
					const { extra: { channel, messageId }, targetId } = auditLog;
					const target = await client.users.fetch(targetId);
					const message = await channel.messages.fetch(messageId);

					embed = logEmbed({
						color: danger,
						user: executor,
						description: `${executor} a désépinglé un [message](${message.url}) de ${target} dans le salon ${channel}.`,
						footer: "Message désépinglé"
					}).addFields(
						{ name: "Message", value: message.content }
					);

					break;
				}

				case AuditLogEvent.RoleCreate: {
					const { targetId } = auditLog;
					const target = await guild.roles.fetch(targetId);

					embed = logEmbed({
						color: success,
						user: executor,
						description: `${executor} a créé le rôle ${target}.`,
						footer: "Rôle créé"
					});

					break;
				}

				case AuditLogEvent.RoleDelete: {
					const { changes } = auditLog;

					embed = logEmbed({
						color: danger,
						user: executor,
						description: `${executor} a supprimé le rôle \`${changes[0].old}\`.`,
						footer: "Rôle supprimé"
					});

					break;
				}

				case AuditLogEvent.RoleUpdate: {
					const { targetId } = auditLog;
					const { name } = await guild.roles.fetch(targetId);

					embed = logEmbed({
						color: warning,
						user: executor,
						description: `${executor} a mis à jour le rôle \`${name}\`.`,
						footer: "Rôle modifié"
					});

					break;
				}

				case AuditLogEvent.StickerCreate: {
					const { targetId } = auditLog;
					const { name, description, format, tags, url } = await guild.stickers.fetch(targetId);

					const formats = {
						1: "PNG",
						2: "APNG",
						3: "Lottie",
						4: "GIF"
					};

					embed = logEmbed({
						color: success,
						user: executor,
						description: `${executor} a créé l'autocollant \`${name}\`.`,
						footer: "Autocollant créé"
					})
						.setThumbnail(url)
						.addFields(
							{ name: "Nom", value: name, inline: true },
							{ name: "Alias", value: `:${tags}:`, inline: true },
							{ name: "Extension", value: formats[format], inline: true },
							{ name: "Description", value: description ?? "Indéfinie" },
							{ name: "URL", value: `${url}` }
						);

					break;
				}

				case AuditLogEvent.StickerDelete: {
					const { target: { name, url } } = auditLog;

					embed = logEmbed({
						color: danger,
						user: executor,
						description: `${executor} a supprimé l'autocollant \`${name}\`.`,
						footer: "Autocollant supprimé"
					}).setThumbnail(url);

					break;
				}

				case AuditLogEvent.StickerUpdate: {
					const { targetId } = auditLog;
					const { name, url } = await guild.stickers.fetch(targetId);

					embed = logEmbed({
						color: warning,
						user: executor,
						description: `${executor} a mis à jour l'autocollant \`${name}\`.`,
						footer: "Autocollant modifié"
					}).setThumbnail(url);

					break;
				}

				case AuditLogEvent.ThreadCreate: {
					const { targetId } = auditLog;
					const target = await client.channels.fetch(targetId);

					embed = logEmbed({
						color: success,
						user: executor,
						description: `${executor} a créé le fil ${target}.`,
						footer: "Fil créé"
					});

					break;
				}

				case AuditLogEvent.ThreadDelete: {
					const { target: { name } } = auditLog;

					embed = logEmbed({
						color: danger,
						user: executor,
						description: `${executor} a supprimé le fil \`${name}\`.`,
						footer: "Fil supprimé"
					});

					break;
				}

				case AuditLogEvent.ThreadUpdate: {
					const { targetId } = auditLog;
					const target = await client.channels.fetch(targetId);

					embed = logEmbed({
						color: warning,
						user: executor,
						description: `${executor} a apporté des modifications au fil ${target}.`,
						footer: "Fil modifié"
					});

					break;
				}

				case AuditLogEvent.WebhookCreate: {
					const { targetId } = auditLog;
					const { name, channelId, url } = await client.fetchWebhook(targetId);

					embed = logEmbed({
						color: success,
						user: executor,
						description: `${executor} a créé le webhook \`${name}\`.`,
						footer: "Webhook créé"
					}).addFields(
						{ name: "Salon", value: `<#${channelId}>`, inline: true },
						{ name: "URL", value: `[Lien](${url})`, inline: true }
					);

					break;
				}

				case AuditLogEvent.WebhookDelete: {
					const { target: { name } } = auditLog;

					embed = logEmbed({
						color: danger,
						user: executor,
						description: `${executor} a supprimé le webhook \`${name}\`.`,
						footer: "Webhook supprimé"
					});

					break;
				}

				case AuditLogEvent.WebhookUpdate: {
					const { targetId } = auditLog;
					const target = await client.fetchWebhook(targetId);

					embed = logEmbed({
						color: warning,
						user: executor,
						description: `${executor} a mis à jour le webhook \`${target.name}\`.`,
						footer: "Webhook modifié"
					}).setThumbnail(target.avatarURL());

					break;
				}

				default: return;
			}

			await client.channels.cache.get(logs).send({ embeds: [embed] });
		} catch (error) {
			console.error(error);
		}
	}
};