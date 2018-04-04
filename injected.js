// Delay in milliseconds between checks to see if a track has started playing
var preObserverUpdateInterval = 1000;
// Observer for changes to track data
var songInfoObserver;
// URL to which xhr notifications of track updates will be sent
const notificationURL = 'https://gpmc.totumiter.com';

/**
 * Send the current track information to all observers
 */
function sendTrackUpdate() {
    // get and encode track data 
    var track = getTrackInfo();
    var data = Object.keys(track)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(track[k])}`)
        .join('&');

    // send the data via XHR
    var xhr = new XMLHttpRequest();
    xhr.open("POST", notificationURL);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(data);
}

/**
 * Get the current track information from the DOM
 */
//todo - add error protection here in case there is no current track information
function getTrackInfo() {
    var title = document.querySelector(Track.TitleId).innerHTML;
    var artist = document.querySelector(Track.ArtistId).innerHTML;
    var album = document.querySelector(Track.AlbumId).innerHTML;
    var art = document.querySelector(Track.ArtworkId).src;
    art = art.substring(0, art.indexOf("="));
    var progress = document.querySelector(Track.ProgressId).innerHTML;
    var duration = document.querySelector(Track.DurationId).innerHTML;

    var track = new Track(title, artist, album, art, progress, duration);
    
    return track;
}

/**
 * Setup the observer for changes in the track data.  If there is no current
 * track data, will timeout and check back every specified interval
 */
function observeTrackChanges() {
    var trackProgress = document.querySelector(Track.ProgressId);
    if( !trackProgress ) {
        setTimeout(observeTrackChanges, preObserverUpdateInterval);
        return;
    }

    // Observe for changes on the current track's progress
    songInfoObserver = new MutationObserver(sendTrackUpdate);
    songInfoObserver.observe(trackProgress, {childList:true});
}

// Check to see if we can start observing track changes
observeTrackChanges();