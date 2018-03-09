(function(){
    // Ensure this script only runs once
    if( window.gpmusicHasRun ) { return; }
    window.gpmusicHasRun = true;

    /**************************************************************************
     * Constant values associated with the Google Play Music web page
     */
    // Shorthand for querying DOM elements
    var $ = document.querySelector.bind(document);

    // Google Play Actions
    var actions = {
        play: "#player-bar-play-pause",
        forward: "#player-bar-forward",
        rewind: "player-bar-rewind",
        lucky: "#iflFab",
        luckyRefresh: "[data id-'refresh']",
        thumbsUp: ".now-playing-actions [icon='sj:thumb-up-outline']",
        thumbsDown: ".now-playing-actions [icon='sj:thumb-down-outline']"
    };
    // Track Information
    var information = {
        currentTrack: {
            title: "#currently-playing-title",
            artwork: "#playerBarArt", // Possibly adjust this so that we get a larger piece of art
            artist: "#player-artist",
            album: "#player-album",
            duration: "#time_container_duration",
            progress: "#time_container_current"
        }
        //TODO: address the queue container
        //queue: "#queueContainer"
    };

    /**************************************************************************
     * Methods to execute controls in the Google Play Music tab
     */

    // process the play clicked event
    function playPauseTrack(){
        console.log('play-pause-track');
        $(actions.play).click();
    }

    function nextTrack(){
        console.log('next');
        $(actions.forward).click();
    }
    function previousTrack(){
        console.log('prev');
        $(actions.rewind).click();
    }

    /**
     * Listen for messages from the background script.
     */
    browser.runtime.onMessage.addListener( (message) => {
        if( message.command === "gpm-control-music" ) {
            switch( message.action ) {
                case "play-pause": playPauseTrack(); break;
                case "next": nextTrack(); break;
                case "previous": previousTrack(); break;
            }
        }
        else { alert('received some other message'); }
    });
})();