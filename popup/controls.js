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
	$(uiHandle.track.title).innerHTML = track.title;
	$(uiHandle.track.album).innerHTML = track.album;
	$(uiHandle.track.artist).innerHTML = track.artist;
	$(uiHandle.track.art).src = track.artwork;
}

/**
 * Update's the currently playing track's progress.
 */
// Last time the progress was changed by the content_script
var lastProgress;
// Current progress time
var progressTime;
function updateProgress2() {
	// var progress = track.progress + " / " + track.duration;
	// Get the current progress and durration 
	var track = playState.currentTrack;
	var progress = track.progress;

	// Check to see if the progress has updated.  Content scripts don't
	//  execute as often when not in the foreground
	// If the time is not updated, calculate based on the last known time
	if( lastProgress === progress ) {
		// Split the progress time into minues and seconds
		var time = progressTime.split(":");
		// Increment the seconds
		time[1]++;
		// if this exceeds a minute, increment minutes and reset seconds
		if( time[1] >= 60 ) {
			time[0]++;
			time[1] = 0;
		}

		// Make sure the seconds are two didgets
		time[1] = time[1].toLocaleString('en-us', {minimumIntegerDigits:2, useGrouping:false});

		progressTime = time.join(":");
		progress = progressTime;
	}else{
		lastProgress = progress;
		progressTime = progress;
	}

	// Update the UI with the current progress
	$(uiHandle.track.progress).innerHTML = progress + " / " + track.duration;

	// wait for another second and then update again
	progressUpdateId = setTimeout(updateProgress, 1000);
}
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

/**
 * Make sure the current track data is updated prior to displaying the track information.
 * If the track information is not initialized, then send a message to update the track
 * information, then make sure the controls are set in paused state, and then exit.
 * 
 * Otherwise, update the current track and progress informaiton.
 */
function initializeContent() {
	var track = playState.currentTrack;
	if( track || track.isTemplate ) {
		pausedPlayback();
		playState.sendGooglePlayAction("update");
	}
	// does this ever fire?
	else{
		updateCurrentTrack();
		updateProgress();
	}
}

// return a thennable so we can delay showing the content until we confirm we have content?
function updatePlayState() {
	console.log("updating play state");
	var isNowPlaying = playState.currentTrack.isPlaying;

	if( isNowPlaying && isPaused) {
		startedResumedPlayback();
	}else if( !isNowPlaying && !isPaused ) {
		pausedPlayback();
	}
}

// Setup and initialize the connection by sending an empty message
// todo: debug why this empty message is necessary to setup the connection
var myPort = browser.runtime.connect({name: "popup"});
myPort.postMessage({});

// Add handlers for messages provided from the background script
myPort.onMessage.addListener( (message) => {
	switch(message.type){
		case "contentUpdated":		updateCurrentTrack(); updateProgress();			break;
		case "updatePlayState":		updatePlayState();								break;
	}
});

// Register to listen for control clicks
Promise.resolve()
.then(listenForClicks())
.then(initializeContent())
.then(updatePlayState())
.catch(reportExecuteScriptError);