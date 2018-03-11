// manage the play state and tab id

// The ID for the currently active, or last active, Google Play Music tab
var gpmTabId;
const GOOGLE_PLAY_MUSIC_URL = "*://play.google.com/*";

// Current port that the open popup is using to communicate with the backround script
var popupPort;

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
	if( popupPort ) 
		popupPort.postMessage({type:"contentUpdated"});
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



/**
 * Listen for connection attempts and setup communication structure for passing messages
 * back and forth.  Setup a disconnect so we know when to stop sending messages to that
 * endpoint.
 * @param {Port} port 
 */
function connect(port) {
	console.log("connecting to: " + port.name);
	popupPort = port;
	popupPort.onMessage.addListener( (message) => {
		switch(message.type) {
			case "action":			sendGooglePlayAction(message.action);			break;
			case "request":			sendGooglePlayAction(message.request);			break;
		}
	});
	popupPort.onDisconnect.addListener( (port) => {
		if( port.error ) {
			console.log(`disconnected due to error: ${port.error.message}`);
		}
	})
}
browser.runtime.onConnect.addListener(connect);