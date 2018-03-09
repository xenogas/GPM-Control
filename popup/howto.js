// Add click listeners
function listenForClicks() {
    document.addEventListener("click", (e) => {
        if( e.target.classList.contains("media-control") ) {
            switch(e.target.textContent){
                case "Play / Pause":
                    return playClicked();
                case "Next":
                    return;
                case "Previous":
                    return;
                case "Rate":
                    return;
                case "Help":
                    return;
            }
        }
    });
}

// process the play clicked event
function playClicked(){
    alert('you clicke the play button, this would have toggled the track to start or  stop it.');
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
browser.tabs.executeScript({file: "/content_scripts/gpmusic.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);