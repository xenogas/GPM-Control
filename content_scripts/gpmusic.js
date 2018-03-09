(function(){
    /**
     * Check and set a global guard variable.  If this content script is injected
     * into the same page again, it will do nothing the next time.
     */
    if( window.gpmusicHasRun ) { return; }
    window.gpmusicHasRun = true;

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

    // process the play clicked event
    function playPauseTrack(){
        alert('you clicke the play button, this would have toggled the track to start or  stop it.');
    }

    function nextTrack(){alert('next');}
    function previousTrack(){alert('prev');}

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