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
	const actions = {
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
		album: ".player-album",
		duration: "#time_container_duration",
		progress: "#time_container_current"
	}
	//TODO: address the queue container
	//queue: "#queueContainer"

	/**************************************************************************
	 * Method to retrieve media information from Google Play Music
	 */
	var updateTimeoutId;
	function synchronizeTrackInformation() {
		var track = {};
		track.title = $(trackInformation.title).innerHTML;
		track.artist = $(trackInformation.artist).innerHTML;
		track.album = $(trackInformation.album).innerHTML;
		track.duration = $(trackInformation.duration).innerHTML;
		track.progress = $(trackInformation.progress).innerHTML;
		track.artwork = $(trackInformation.artwork).src;
		track.artwork = track.artwork.substring(0, track.artwork.indexOf("="));
		// track.isPlaying = isTrackPlaying();
		// console.log("track is playing: " + track.isPlaying);
		
		// Log retreived data (minus artwork src)
		// console.log(track.title + "\t" + track.artist + "\t" + track.album + "\t" + track.progress + "/" + track.duration);
		
		// TODO: push this to the background script
		browser.runtime.sendMessage({type:"updateTrack", track: track});
	}
	/**
	 * Helper function to determine the current play state
	 */
	function isTrackPlaying() {
		var isPlaying = false;

		var audioElements = document.getElementsByTagName("audio");
		for( var i = 0; i < audioElements.length; i++ ) {
			if( !audioElements[i].paused ) {
				isPlaying = true;
			}
		}
		
		return isPlaying;
	}
	/**
	 * Synchronize the play state with the background & popup
	 */
	// function syncronizePlayState() {
	// 	console.log("checking to see if the track is playing");
	// 	var isPlaying = isTrackPlaying();
	// 	console.log("is track playing " + isPlaying);
	// 	browser.runtime.sendMessage({type:"updatePlayState", isPlaying: isPlaying});
	// }

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

	// Synchronize the current track information and setup an observer to 
	// listen for any changes and resynchronize.
	// The duration element updates every second
	synchronizeTrackInformation();
	var songInfoObserver = new MutationObserver(synchronizeTrackInformation);
	songInfoObserver.observe( $("#time_container_duration"), {childList:true} );
	
	//TODO: Observe for pause button click and notifiy the player that the audio is not currently playing
	// syncronizePlayState();
	// var playPauseObserver = new MutationObserver(syncronizePlayState);
	// playPauseObserver.observe( $("#player-bar-play-pause"), {attributes:true} );
})();