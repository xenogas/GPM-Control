// Request URLs which the track update listener will capture
var updateTrackFilters = {urls: ['*://*.totumiter.com/*']};
// Configuration options for the track update request listener
var updateTrackOptions = ['blocking', 'requestBody'];
// Track object containing the current track's information
var currentTrack = {};

/**
 * Updates the current track reference with the details provided.
 * @param {String} details URL form encoded track information
 */
function updateTrack(details) {
	// console.log(`loading: ${details.url}`);
	if( details.method == 'POST' ) {
		var data = details.requestBody.formData;
		currentTrack = extractTrackFromForm(data);
		console.log(currentTrack);
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

// Listen for update notifications
browser.webRequest.onBeforeRequest.addListener(
	updateTrack,
	updateTrackFilters,
	updateTrackOptions
)