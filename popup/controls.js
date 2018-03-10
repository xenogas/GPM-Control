// The background script maintaining state
var playState = browser.extension.getBackgroundPage();
var $ = document.querySelector.bind(document);

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
	});
	$(uiHandle.control.pause).addEventListener("click", (e) => {
		playState.sendGooglePlayAction(controlAction.pause);
	});
	$(uiHandle.control.next).addEventListener("click", (e) => {
		playState.sendGooglePlayAction(controlAction.next);
	});
	$(uiHandle.control.rewind).addEventListener("click", (e) => {
		playState.sendGooglePlayAction(controlAction.rewind);
	});
}

function updateCurrentTrack() {
	var track = playState.currentTrack;
	if( !track ) return;

	$(uiHandle.track.title).innerHTML = track.title;
	$(uiHandle.track.album).innerHTML = track.album;
	$(uiHandle.track.artist).innerHTML = track.artist;

	$(uiHandle.track.art).src = track.artwork;
}
var progressUpdateId;
function updateProgress() {
	var track = playState.currentTrack;
	if( !track ) return;

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
 * When the popup loads, inject a content script into the active tab, and add
 * a click handler.
 */
// browser.tabs.executeScript({})
// .then(listenForClicks)
// .catch(reportExecuteScriptError);

// Register to listen for control clicks
new Promise((resolve, reject) => {
	setTimeout(resolve, 100);
})
.then(listenForClicks())
.then(updateCurrentTrack())
.then(updateProgress())
.catch(reportExecuteScriptError);