class MediaControl {
	constructor() {
		browser.runtime.onMessage.addListener(this.onMessage.bind(this));
	}

	/**
	 * Listener for message requests to this window / object.  Handles media 
	 * control, rating, and update requests.
	 * 
	 * @param {Object} message communication including the type of request 
	 * and any request data
	 * @param {Object} sender origin of the request
	 * @param {Function} sendResponse callback to which a response can be provided
	 */
	onMessage(message, sender, sendResponse) {
		switch( message.type ) {
			case Message.Type.Play:			this.play();				break;
			case Message.Type.Pause:		this.pause();				break;
			case Message.Type.Forward:		this.next();				break;
			case Message.Type.Rewind:		this.rewind();				break;
		}
	}

	/**
	 * Helper function to determine the current play state
	 */
	play() {
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
	get isPlaying() {
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
	static get PauseId() { return "#player-bar-play-pause"; }
	static get ForwardId() { return "#player-bar-forward"; }
	static get RewindId() { return "#player-bar-rewind"; }
	static get LuckyId() { return "#iflFab"; }
	static get LuckyRefreshId() { return "[data id-'refresh']"; }
	static get ThumbsUpId() { return ".now-playing-actions [icon='sj:thumb-up-outline']"; }
	static get ThumbsDownId() { return ".now-playing-actions [icon='sj:thumb-down-outline']"; }
}