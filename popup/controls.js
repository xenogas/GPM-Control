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
const popupComponent = {
	loading: "#loading",
	error: "#error-content",
	popup: "#popup-content"
}
// Various types of messages which the popup sends to the background script
const messageType = {
	action:			"action",
	request:		"request"
}

/**
 * Add event listeners for the media control hooks
 */
function listenForClicks() {
	$(uiHandle.control.play).addEventListener("click", (e) => {
		myPort.postMessage({type: messageType.action, action: controlAction.play});
		startedResumedPlayback();
	});
	$(uiHandle.control.pause).addEventListener("click", (e) => {
		myPort.postMessage({type: messageType.action, action: controlAction.pause});
		pausedPlayback();
	});
	$(uiHandle.control.next).addEventListener("click", (e) => {
		myPort.postMessage({type: messageType.action, action: controlAction.next});
	});
	$(uiHandle.control.rewind).addEventListener("click", (e) => {
		myPort.postMessage({type: messageType.action, action: controlAction.rewind});
	});
}

/**
 * Synchronize the playback controls in a playing state and restart the
 * progress update's update loop.
 */
function startedResumedPlayback() {
	// Toggle Play/Pause display now that we've started playback
	$(uiHandle.control.play).classList.add("hidden");
	$(uiHandle.control.pause).classList.remove("hidden");
	
	// Restart the progress update loop
	updateProgress();
	isPaused = false;
}

/**
 * Synchronize the playback controls in a paused state and disable the 
 * progress update's update loop.
 */
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
	$(popupComponent.loading).classList.add("hidden");
	$(popupComponent.popup).classList.add("hidden");
	$(popupComponent.error).classList.remove("hidden");
	console.error('Failed to execute a Google Play Music hook content script: ${error.message}');
}

/**
 * Make sure the current track data is updated prior to displaying the track information.
 * If the track information is not initialized, then send a message to update the track
 * information, then make sure the controls are set in paused state, and then exit.
 * 
 * Otherwise, update the current track and progress informaiton.
 */
function initializeContent() {
	var track = playState.currentTrack;
	if( track && track.isTemplate ) {
		pausedPlayback();
		myPort.postMessage({type: messageType.request, request: "update"});
	}
	// track information already initialized, go ahead and update
	else{
		updateContent();
	}
}

/**
 * Update the popup's control's play state to match that of Google Play Music.
 */
function updatePlayState() {
	var isNowPlaying = playState.currentTrack.isPlaying;

	if( isNowPlaying && isPaused) {
		startedResumedPlayback();
	}else if( !isNowPlaying && !isPaused ) {
		pausedPlayback();
	}
}

/**
 * Update the popup's current track content and progress
 */
function updateContent() {
	// Update track information
	updateCurrentTrack();
	// Update current progress
	updateProgress();
}

// Setup and initialize the connection by sending an empty message
// todo: debug why this empty message is necessary to setup the connection
var myPort = browser.runtime.connect({name: "popup"});
myPort.postMessage({});

// Add handlers for messages provided from the background script
myPort.onMessage.addListener( (message) => {
	switch(message.type){
		case "contentUpdated":		updateContent();				break;
		case "updatePlayState":		updatePlayState();				break;
	}
});

// Register to listen for control clicks
Promise.resolve()
.then(listenForClicks())
.then(initializeContent())
.then(updatePlayState())
.catch(reportExecuteScriptError);