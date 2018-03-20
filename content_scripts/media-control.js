class MediaControl {
    constructor() {
    }

    /**
	 * Helper function to determine the current play state
	 */
    play() {
        console.log(MediaControl.PlayId);
        document.querySelector(MediaControl.PlayId).click();
    }

    /**
	 * Forward a click event to Google Play Music's play-pause button.
	 */
    pause() {
        document.querySelector(MediaControl.PauseId).click();
    }

    /**
	 * Forward a click event to Google Play Music's next track (forward) button.
	 */
    next() {
        document.querySelector(MediaControl.ForwardId).click();
        // focus on the duration to force update it
        document.querySelector(Track.DurationId).focus();
    }

    /**
	 * Forward a click event to Google Play Music's rewind button.
	 */
    rewind() {
        document.querySelector(MediaControl.RewindId).click();
        // focus on the duration to force update it
        document.querySelector(Track.DurationId).focus();
    }

    /**
	 * Helper function to determine the current play state
	 */
    isPlaying() {
        var isPlaying = false;

		var audioElements = document.getElementsByTagName("audio");
		for( var i = 0; i < audioElements.length; i++ ) {
			if( !audioElements[i].paused ) {
				isPlaying = true;
			}
		}
		
		return isPlaying;
    }

    // DOM IDs for the associated elements
    static get PlayId() { return "#player-bar-play-pause"; }
    static get ForwardId() { return "#player-bar-forward"; }
    static get RewindId() { return "#player-bar-rewind"; }
    static get LuckyId() { return "#iflFab"; }
    static get LuckyRefreshId() { return "[data id-'refresh']"; }
    static get ThumbsUpId() { return ".now-playing-actions [icon='sj:thumb-up-outline']"; }
    static get ThumbsDownId() { return ".now-playing-actions [icon='sj:thumb-down-outline']"; }
}