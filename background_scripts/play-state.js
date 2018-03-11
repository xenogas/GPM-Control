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
	isPlaying:	false,
	isTemplate: true
};
var isPopupInitialized = false;

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
	if( port && isPopupInitialized ) 
		// browser.runtime.sendMessage({type:"contentUpdated"});
		port.postMessage({type:"contentUpdated"});
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

var port;
function connect(p) {
	console.log(p.name);
	port = p;
	// port.postMessage({greeting:"hi from background"});
	port.onMessage.addListener( (m) => {
		isPopupInitialized = true;
		// console.log("in background connect message listener");
		// console.log(m.greeting);
	});
	port.onDisconnect.addListener( (port) => {
		if( port.error ) {
			console.log(`disconnected due to error: ${port.error.message}`);
		}
		isPopupInitialized = false;
	})
}
browser.runtime.onConnect.addListener(connect);