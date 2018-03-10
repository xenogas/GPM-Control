// manage the play state and tab id

const GOOGLE_PLAY_MUSIC_URL = "*://play.google.com/*";
// The ID for the currently active, or last active, Google Play Music tab
var gpmTabId;
var currentTrack;

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

function receiveMessage(message) {
    if( message.track && message.track.title ){
        currentTrack = message.track;
    }
}

browser.runtime.onMessage.addListener(receiveMessage);