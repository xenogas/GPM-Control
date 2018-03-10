// The background script maintaining state
var playState = browser.extension.getBackgroundPage();

/**
 * Add event listeners for the media control hooks
 */
function listenForClicks() {
    document.querySelector("#play").addEventListener("click", (e) => {
        playState.sendGooglePlayAction("play-pause");
    });
    document.querySelector("#pause").addEventListener("click", (e) => {
        playState.sendGooglePlayAction("play-pause");
    });
    document.querySelector("#next").addEventListener("click", (e) => {
        playState.sendGooglePlayAction("next");
    });
    document.querySelector("#rewind").addEventListener("click", (e) => {
        playState.sendGooglePlayAction("rewind");
    });
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
.catch(reportExecuteScriptError);