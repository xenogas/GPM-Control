// Request URLs which the track update listener will capture
var updateTrackFilters = { urls: ['*://*.totumiter.com/*'] };
// Configuration options for the track update request listener
var updateTrackOptions = ['blocking', 'requestBody'];
// Track object containing the current track's information
var currentTrack = {};
// Current or last active GPM tab, -1 if none available
var currentPlayer = {id:-1, isPlaying:false};

/**
 * Updates the current track reference with the details provided.
 * @param {String} details URL form encoded track information
 */
function updateTrack(details) {
	if (details.method == 'POST') {
		var data = details.requestBody.formData;
		currentTrack = extractTrackFromForm(data);
		currentPlayer = extractPlayerFromForm(data);
		// console.log(currentTrack);

		return {cancel: true};
	}
}

/**
 * Extracts and recreates the Track object as defined by the data within the form.
 * @param {Object} form formData object containing track information
 */
function extractTrackFromForm(form) {
	var track = new Track(
		form.title[0],
		form.artist[0],
		form.album[0],
		form.artwork[0],
		form.progress[0],
		form.duration[0]
	);
	track.creationTime = new Date(form.creationTime[0]);
	return track;
}

/**
 * Extracts and recreats the media player as defined by the data within the form.
 * @param {String} form URL encoded form data containing MediaPlayer information
 */
function extractPlayerFromForm(form) {
	var player = new MediaPlayer(
		currentPlayer.id,
		form.isPlaying[0]==='true'
	);
	return player;
}

// Listen for update notifications
browser.webRequest.onBeforeRequest.addListener(
	updateTrack,
	updateTrackFilters,
	updateTrackOptions
);