const { DisTube } = require("distube");
const YouTubeMusicPlugin = require("ytmusic-distube-plugin");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { SpotifyPlugin } = require("@distube/spotify");
const { DeezerPlugin } = require("@distube/deezer");
const { DirectLinkPlugin } = require("@distube/direct-link");
const { FilePlugin } = require("@distube/file");

module.exports = (client) => {
	client.distube = new DisTube(client, {
		emitNewSongOnly: true,
		savePreviousSongs: true,
		nsfw: true,
		emitAddListWhenCreatingQueue: true,
		emitAddSongWhenCreatingQueue: true,
		plugins: [
			new YouTubeMusicPlugin(),
			new SoundCloudPlugin(),
			new SpotifyPlugin(),
			new DeezerPlugin(),
			new DirectLinkPlugin(),
			new FilePlugin(),
		],
	});
};
