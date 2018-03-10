// The background script maintaining state
var playState = browser.extension.getBackgroundPage();
var $ = document.querySelector.bind(document);

// Handle to the current track's progress update timeout.
var progressUpdateId;
// Indicates Google Play Music is currently paused across all tabs
var isPaused = true;

// References to UI handles in the HTML
const uiHandle = {
	track: {
		art:		"#current-artwork",
		title:		"#current-title",
		artist:		"#current-artist",
		album:		"#current-album",
		progress:	"#current-progress"
	},
	control: {
		play:		"#play",
		pause:		"#pause",
		next:		"#next",
		rewind:		"#rewind"
	}
};
const controlAction = {
	play:   		"play-pause",
	pause:  		"play-pause",
	next:   		"next",
	rewind: 		"rewind"
}

/**
 * Add event listeners for the media control hooks
 */
function listenForClicks() {
	$(uiHandle.control.play).addEventListener("click", (e) => {
		playState.sendGooglePlayAction(controlAction.play);
		startedResumedPlayback();
	});
	$(uiHandle.control.pause).addEventListener("click", (e) => {
		playState.sendGooglePlayAction(controlAction.pause);
		pausedPlayback();
	});
	$(uiHandle.control.next).addEventListener("click", (e) => {
		playState.sendGooglePlayAction(controlAction.next);
	});
	$(uiHandle.control.rewind).addEventListener("click", (e) => {
		playState.sendGooglePlayAction(controlAction.rewind);
	});
}

function startedResumedPlayback() {
	// Toggle Play/Pause display now that we've started playback
	$(uiHandle.control.play).classList.add("hidden");
	$(uiHandle.control.pause).classList.remove("hidden");
	
	// Restart the progress update loop
	updateProgress();
	isPaused = false;
}
function pausedPlayback() {
	// Toggle Play/Pause display now that we've stopped playback
	$(uiHandle.control.pause).classList.add("hidden");
	$(uiHandle.control.play).classList.remove("hidden");

	// Stop the progress update loop
	clearTimeout(progressUpdateId);
	isPaused = true;
}

/**
 * Updates the currently playing track information including:
 * 	Title, Artist, Album, and Artwork.
 */
function updateCurrentTrack() {
	var track = playState.currentTrack;
	if( !track ) return;

	$(uiHandle.track.title).innerHTML = track.title;
	$(uiHandle.track.album).innerHTML = track.album;
	$(uiHandle.track.artist).innerHTML = track.artist;

	$(uiHandle.track.art).src = track.artwork;
}

/**
 * Update's the currently playing track's progress.
 */
function updateProgress() {
	var track = playState.currentTrack;
	var progress = track.progress + " / " + track.duration;
	$(uiHandle.track.progress).innerHTML = progress;

	progressUpdateId = setTimeout(updateProgress, 1000);
}

/**
 * Report any errors exicuting the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
	document.querySelector("#popup-content").classList.add('hidden');
	document.querySelector("#error-content").classList.remove('hidden');
	console.error('Failed to execute a Google Play Music hook content script: ${error.message}');
}

// Register to listen for control clicks
new Promise((resolve, reject) => {
	setTimeout(resolve, 100);
})
.then(listenForClicks())
.then(updateCurrentTrack())
// .then(()=>{
// 	debugger;
// 	updatePlayState(playState.currentTrack.isPlaying);
// })
.catch(reportExecuteScriptError);


function updatePlayState(isNowPlaying) {
	console.log("updating play state");
	if( isNowPlaying && isPaused) {
		startedResumedPlayback();
	}else if( !isNowPlaying && !isPaused ) {
		pausedPlayback();
	}
}

function receivePopupMessage(message) {
	if( !message.type ) return;
	switch(message.type) {
		case "updatePlayState":		updatePlayState(message.isPlaying);				break;
	}
}
browser.runtime.onMessage.addListener(receivePopupMessage);