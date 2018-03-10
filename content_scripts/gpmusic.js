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
		rewind: "#player-bar-rewind",
		lucky: "#iflFab",
		luckyRefresh: "[data id-'refresh']",
		thumbsUp: ".now-playing-actions [icon='sj:thumb-up-outline']",
		thumbsDown: ".now-playing-actions [icon='sj:thumb-down-outline']"
	};
	// Track Information
	const trackInformation = {
		title: "#currently-playing-title",
		artwork: "#playerBarArt", // Possibly adjust this so that we get a larger piece of art
		artist: "#player-artist",
		album: "#player-album",
		duration: "#time_container_duration",
		progress: "#time_container_current"
	}
	//TODO: address the queue container
	//queue: "#queueContainer"

	/**************************************************************************
	 * Method to retrieve media information from Google Play Music
	 */
	function synchronizeTrackInformation() {
		var track = {
			title: $(trackInformation.title).innerHTML,
			artist: $(trackInformation.artist).innerHTML,
			album: $(trackInformation.album).innerHTML,
			artwork: $(trackInformation.artwork).innerHTML,
			duration: $(trackInformation.duration).innerHTML,
			progress: $(trackInformation.progress).innerHTML
		};
		
		// TODO: push this to the background script
	}

	/**************************************************************************
	 * Methods to execute controls in the Google Play Music tab
	 */

	// process the play clicked event
	function playPauseTrack(){
		$(actions.play).click();
	}
	function nextTrack(){
		$(actions.forward).click();
	}
	function rewindTrack(){
		$(actions.rewind).click();
	}
	// TODO: look into adding seek control, this would apply both here and on the controls html

	/**
	 * Listen for messages from the background script.
	 */
	browser.runtime.onMessage.addListener( (message) => {
		if( message.command === "gpm-control-music" ) {
			switch( message.action ) {
				case "play-pause":		playPauseTrack();		break;
				case "next":			nextTrack();			break;
				case "rewind":			rewindTrack();			break;
			}
		}
		else { alert('received some other message'); }
	});
	// listen for DOM changes
	setInterval( synchronizeTrackInformation, 1000);
})();