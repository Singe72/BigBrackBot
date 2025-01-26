const { CronJob } = require("cron");
const { clientColor, nasa: api_key } = require("../config.json");
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

const createNasaJob = (client) => {
    return CronJob.from({
        cronTime: "0 3 * * *",
        onTick: async function () {
            const url = `https://api.nasa.gov/planetary/apod?api_key=${api_key}&concept_tags=True&thumbs=True`;
            const channelId = "656568484448305173";

            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data.media_type === "image") {
                    const embed = new EmbedBuilder()
                        .setColor(clientColor)
                        .setTitle("Image du jour de la NASA")
                        .setDescription(`
                            __${data.title}__ ${data.date}
                            ${data.copyright ? `*© ${data.copyright.replace(/\n/g, "")}*` : ""}
                        `)
                        .setImage(data.hdurl ? data.hdurl : data.url)
                        .setFooter({ text: "Source : NASA" });

                    return client.channels.cache.get(channelId).send({ embeds: [embed] });
                } else if (data.media_type === "video") {
                    const embed = new EmbedBuilder()
                        .setColor(clientColor)
                        .setTitle("Image du jour de la NASA")
                        .setDescription(`
                            __${data.title}__ ${data.date}
                            ${data.copyright ? `*© ${data.copyright}*` : ""}
                        `)
                        .setImage(data.thumbnail_url)
                        .setFooter({ text: "Source : NASA" });

                    const button = new ButtonBuilder()
                        .setLabel("Voir la vidéo")
                        .setURL(data.url)
                        .setStyle(ButtonStyle.Link);

                    const row = new ActionRowBuilder().addComponents(button);

                    return client.channels.cache.get(channelId).send({ embeds: [embed], components: [row] });
                }
            } catch (error) {
                console.error(error);
            }
        },
        start: false,
        timeZone: "Europe/Paris",
    });
};

module.exports = createNasaJob;
