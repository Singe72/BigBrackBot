const { LavalinkManager } = require("lavalink-client");

module.exports = (client) => {
	client.lavalink = new LavalinkManager({
		nodes: [
			{
				authorization: process.env.LAVALINK_PASSWORD ?? "youshallnotpass",
				host: process.env.LAVALINK_HOST ?? "lavalink",
				port: Number(process.env.LAVALINK_PORT ?? 2333),
				id: "main",
				retryAmount: 10,
				retryDelay: 5000,
			},
		],
		sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
		autoSkip: true,
		client: {
			id: "",
			username: "BigBrackBot",
		},
		playerOptions: {
			applyVolumeAsFilter: false,
			clientBasedPositionUpdateInterval: 50,
			defaultSearchPlatform: "ytmsearch",
			volumeDecrementer: 1,
			onDisconnect: {
				autoReconnect: true,
				destroyPlayer: false,
			},
		},
		queueOptions: {
			maxPreviousTracks: 25,
		},
	});

	client.once("ready", () => {
		client.lavalink.options.client.id = client.user.id;
		client.lavalink.init({ id: client.user.id, username: client.user.username }).catch(console.error);
	});

	client.on("raw", (d) => client.lavalink.sendRawData(d));
};
