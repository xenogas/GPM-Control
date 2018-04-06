Object.defineProperty(document, "hidden", { value : false});
// Delay in milliseconds between checks to see if a track has started playing
var preObserverUpdateInterval = 1000;
// URL to which xhr notifications of track updates will be sent
const notificationURL = 'https://gpmc.totumiter.com';
// References the last tick's player state
var lastPlayerState = new MediaPlayer(-1, false);

/**
 * Send the current track information to all observers
 */
function sendTrackUpdate() {
	var player = getPlayerState();

	if( shouldSendUpdate(player) ) {
		// encode track and player data 
		var track = getTrackInfo();
		// console.log(track);
		track = encodeFormData(track);
		player = encodeFormData(player);
		var data = `${track}&${player}`;
	
		// send the data via XHR
		var xhr = new XMLHttpRequest();
		xhr.open("POST", notificationURL);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.send(data);
	}	
}

/**
 * Encode a singly deep JSON object into a URI component for passing via XHR.
 * @param {Object} data JSON Object to be encoded
 */
function encodeFormData(data) {
	return Object.keys(data)
		.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`)
		.join('&');
}

/**
 * Get the current track information from the DOM
 */
//todo - add error protection here in case there is no current track information
function getTrackInfo() {
	var title = document.querySelector(Track.TitleId).innerHTML;
	var artist = document.querySelector(Track.ArtistId).innerHTML;
	var album = document.querySelector(Track.AlbumId).innerHTML;
	var art = document.querySelector(Track.ArtworkId).src;
	art = art.substring(0, art.indexOf("="));
	var progress = document.querySelector(Track.ProgressId).innerHTML;
	var duration = document.querySelector(Track.DurationId).innerHTML;

	var thumbsUp = document.querySelector(Track.ThumbsUpId);
	thumbsUp = Track.isRatingSelected(thumbsUp);
	var thumbsDown = document.querySelector(Track.ThumbsDownId);
	thumbsDown = Track.isRatingSelected(thumbsDown);

	var track = new Track(title, artist, album, art, progress, duration, thumbsUp, thumbsDown);
	
	return track;
}

/**
 * Get's the current player's play state (playing / paused) 
 */
function getPlayerState() {
	var player = new MediaPlayer(
		-1,
		isTrackPlaying()
	);
	return player;
}

/**
 * Determines if a track update should be sent by comparing the current and
 * last tick's player states.
 * @param {MediaPlayer} player defines the current media player's state
 */
function shouldSendUpdate(player) {
	var shouldUpdate = player.isPlaying || lastPlayerState.isPlaying;
	lastPlayerState = player;
	return shouldUpdate;
}

/**
 * Helper function to determine the current play state
 */
function isTrackPlaying() {
	var isPlaying = false;

	var audioElements = document.getElementsByTagName("audio");
	for( var i = 0; i < audioElements.length; i++ ) {
		if( !audioElements[i].paused ) {
			isPlaying = true;
		}
	}
	
	return isPlaying;
}

/**
 * Setup the observer for changes in the track data.  If there is no current
 * track data, will timeout and check back every specified interval
 */
function observeTrackChanges() {
	var trackProgress = document.querySelector(Track.TitleId);
	if( !trackProgress ) {
		setTimeout(observeTrackChanges, preObserverUpdateInterval);
		return;
	}

	setInterval(sendTrackUpdate, 1000);
}

// Check to see if we can start observing track changes
observeTrackChanges();