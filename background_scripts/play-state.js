// manage the play state and tab id

// The ID for the currently active, or last active, Google Play Music tab
var gpmTabId;
const GOOGLE_PLAY_MUSIC_URL = "*://play.google.com/*";

// Objject holding reference to the currently connected tabs and popup window
var ports = {};
// Ids for the currently active tab and popup window
var popupPortId, gpmPortId;

// Template for the current track information
var currentTrack = new Track('title', 'artist', 'album', '/img/album-ph.png', 'x:xx', 'x:xx');
currentTrack.isPlaying = false;
currentTrack.isTemplate = true;

/**
 * Forward messages from the popup script to the currently active Google PLay Music (GPM) tab.
 * 
 * @param {string} command Message command to be forwarded to the current active GPM tab
 */
function sendGooglePlayAction(command) {
	if( gpmPortId && ports[gpmPortId] ) {
		ports[gpmPortId].postMessage({action: command});
	}else{
		console.log("no currently active GPM tab.  will need to query for an active tab or spawn one");
	}
}

/**
 * Store a reference to the provided track as the currently playing track and send a notification
 * to the popup script to update its information.  If the play state has changed, also send
 * a notification to update the current play state.
 * 
 * @param {Object} track Object contianing the currently playing track's informaiton
 */
function updateTrackInformation(track) {
	// Determine the previous play state
	var oldPlayState = currentTrack.isPlaying;

	// Update the current track information
	currentTrack = track;
	
	if( popupPortId && ports[popupPortId] ) {
		// Notify the popup of the update if it is present
		ports[popupPortId].postMessage({type:"contentUpdated"});

		// Notify if the play state has changed
		if( oldPlayState !== track.isPlaying ){
			ports[popupPortId].postMessage({type:"updatePlayState"});
		}
	}
}

/**
 * Listen for connection attempts and setup communication structure for passing messages
 * back and forth.  Setup a disconnect so we know when to stop sending messages to that
 * endpoint.
 * 
 * @param {Port} port reference to the connecting tab or popup.
 */
function connect(port) {
	console.log(`connectiong to ${port.name}`);
	
	// Determine which component we're dealing with and assign the current active
	// popup or gpm port for future reference
	var portId;

	// Setup communications with the popup script
	if( port.name === "popup" ){ 
		portId = popupPortId = port.name;
		port.onMessage.addListener( (message) => {
			switch(message.type){
				case "action":			sendGooglePlayAction(message.action);			break;
				case "request":			sendGooglePlayAction(message.request);			break;	
			}
		});
		port.onDisconnect.addListener( (port) => {
			// remove the refernece to the port
			delete ports[popupPortId];
			popupPortId = null;

			// Notify if there was an error with the port
			if( port.error ) {
				console.log(`disconnected due to error: ${port.error.message}`);
			}
		});
	}
	// Setup communications with the background script
	else{
		portId = gpmPortId = port.sender.tab.id;
		port.onMessage.addListener( (message) => {
			switch(message.type) {
				case "updateTrack":			updateTrackInformation(message.track);			break;
				case "updatePlayState":		updatePlayState(message.isPlaying);				break;
			}
		});
		port.onDisconnect.addListener( (port) => {
			// remove the stored refrence to the port
			delete ports[port.sender.tab.id];

			// if was the active gpm tab, remove active reference
			gpmPortId = (port.sender.tab.id === gpmPortId) ? null : gpmPortId;

			// Notify if there was an error with the port
			if( port.error ) {
				console.log(`disconnected due to error: ${port.error.message}`);
			}
		});
	}

	// Store the refernece to this port
	ports[portId] = port;
}
browser.runtime.onConnect.addListener(connect);