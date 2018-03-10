// manage the play state and tab id

const GOOGLE_PLAY_MUSIC_URL = "*://play.google.com/*";
// The ID for the currently active, or last active, Google Play Music tab
var gpmTabId;
var currentTrack = {
	title:	"Title",
	artist:	"Artist",
	album:	"Album",
	artwork:	"/img/album-ph.png",
	progress:	"x:xx",
	duration:	"x:xx",
	isPlaying:	false
};

/**
 * Returns a thenable who's value is the currently active Google PLay Music's
 * tab.
 */
function getGooglePlayTab() {
	return browser.tabs.query({url:GOOGLE_PLAY_MUSIC_URL})
	.then( (tabs) => {
		if( tabs.length > 0 ) {
			return tabs[0];
		}
	});
}

function sendGooglePlayAction(command) {
	getGooglePlayTab()
	.then( (tab) => {
		browser.tabs.sendMessage(tab.id, {
			command: "gpm-control-music",
			action: command
		});
	});
}

function updateTrackInformation(track) {
	currentTrack = track;
}
function updatePlayState(isPlaying) {
	console.log("test");
	currentTrack.isPlaying = (isPlaying === true);
	console.log("updating track play state from background.  Track is playing: " + track.isPlaying);
}

function receiveMessage(message) {
	switch(message.type) {
		case "updateTrack":			updateTrackInformation(message.track);			break;
		case "updatePlayState":		updatePlayState(message.isPlaying);				break;
	}
}
browser.runtime.onMessage.addListener(receiveMessage);