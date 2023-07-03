const { DisTube } = require("distube");
const { DeezerPlugin } = require("@distube/deezer");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YtDlpPlugin } = require("@distube/yt-dlp");

module.exports = (client) => {
	client.distube = new DisTube(client, {
		emitNewSongOnly: true,
		leaveOnEmpty: true,
		leaveOnFinish: false,
		leaveOnStop: false,
		savePreviousSongs: true,
		searchSongs: 0,
		nsfw: true,
		emitAddListWhenCreatingQueue: true,
		emitAddSongWhenCreatingQueue: true,
		plugins: [
			new DeezerPlugin(),
			new SpotifyPlugin({
				emitEventsAfterFetching: true
			}),
			new SoundCloudPlugin(),
			new YtDlpPlugin()
		]
	});
};