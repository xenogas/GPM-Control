// The background script maintaining state
var playState = browser.extension.getBackgroundPage();

// This tab's ID for future reference.  See about changing this for future structure
// (can we reference a static tab when we're talking about the active tab?)
// var tabId;
// browser.tabs.query({currentWindow: true, active: true})
// .then( (tabs) => {
//     if( tabs.length > 0 ) {
//         tabId = tabs[0].id;
//     }
// });

/**
 * Add event listeners for the media control hooks
 */
function listenForClicks() {
    document.addEventListener("click", (e) => {
        if( e.target.classList.contains("media-control") ) {
            var action;
            switch(e.target.textContent){
               case "Play / Pause":
                   action = "play-pause";
                   break;
               case "Next":
                   action = "next";
                   break;
               case "Previous":
                   action = "previous";
                   break;
               case "Rate":
                   action = "help";
                   break;
            }
            
            // Send the event to the Google Play Music's content script to execute
            playState.getGooglePlayTab()
            .then( (tab) => {
                console.log("tab: " + tab);
                browser.tabs.sendMessage(tab.id, {
                    command: "gpm-control-music",
                    action: action
                });
            });
        }
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
// browser.tabs.executeScript({file: "/content_scripts/gpmusic.js"})
// .then(listenForClicks)
// .catch(reportExecuteScriptError);
// console.log("tab is: " + playState.getGooglePlayTab());
//var gpmt = playState.getGooglePlayTab();
//console.log("id is: " + gpmt);

// Register to listen for control clicks
listenForClicks();