const { DisTube } = require("distube");
const { DeezerPlugin } = require("@distube/deezer");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { YouTubePlugin } = require("@distube/youtube");

module.exports = (client) => {
	client.distube = new DisTube(client, {
		emitNewSongOnly: true,
		savePreviousSongs: true,
		nsfw: true,
		emitAddListWhenCreatingQueue: true,
		emitAddSongWhenCreatingQueue: true,
		plugins: [
			new DeezerPlugin(),
			new SpotifyPlugin(),
			new SoundCloudPlugin(),
			new YouTubePlugin(),
			new YtDlpPlugin()
		]
	});
};