// manage the play state and tab id

const GOOGLE_PLAY_MUSIC_URL = "*://play.google.com/*";
// The ID for the currently active, or last active, Google Play Music tab
var gpmTabId;

/**
 * Returns a thenable who's value is the currently active Google PLay Music's
 * tab.
 */
function getGooglePlayTab() {
    return browser.tabs.query({url:GOOGLE_PLAY_MUSIC_URL})
    .then( (tabs) => {
        if( tabs.length > 0 ) {
            console.log("bg tab id: " + tabs[0].id);
            return tabs[0];
        }
    });
}