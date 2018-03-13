(function(){
	// Ensure this script only runs once
	if( window.gpmusicHasRun ) { return; }
	window.gpmusicHasRun = true;

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
	// The track as of the last update cycle
	var lastTrack;
	//TODO: address the queue container
	//queue: "#queueContainer"

	/**
	 * Update the background script with the current track inforamtion if explicitly
	 * requested or if any of the track information, including play state, has changed.
	 * 
	 * @param {Boolean} isUpdateRequested True if an update was explicitly requested
	 */
	function updateTrackData(isUpdateRequested) {
		// Retrieve the current track information from the DOM
		var track = getTrackData();
		
		// Determine if the track information has changed since last cycle
		var hasTrackChanged = !areTracksEqual(track, lastTrack);

		// Push update if requested or track information has changed
		if( (isUpdateRequested === true) || hasTrackChanged ) {
			var d = new Date();
			var time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
			console.log(`${time} - Updating track data\nrequested: ${isUpdateRequested}\t\tchanged:${hasTrackChanged}`);
			// Notify changes
			if ( myPort ) {
				myPort.postMessage({type: "updateTrack", track: track});
			}
		}
		// Update the last track for next cycle's comparison
		lastTrack = track;
	}

	/**
	 * Retrieve current track informaiton, including it's play state, from the DOM.
	 */
	function getTrackData(){
		var track = {};
		track.updateTime = new Date();
		track.title = $(trackInformation.title).innerHTML;
		track.artist = $(trackInformation.artist).innerHTML;
		track.album = $(trackInformation.album).innerHTML;
		track.duration = $(trackInformation.duration).innerHTML;
		track.progress = $(trackInformation.progress).innerHTML;
		track.artwork = $(trackInformation.artwork).src;
		track.artwork = track.artwork.substring(0, track.artwork.indexOf("="));
		track.isPlaying = isTrackPlaying();
		return track;
	}

	/**
	 * Compare two track objects against eachother to see there are any significant
	 * differences.  They will be compared in: Title, Artist, Album, and Play State.
	 * 
	 * @param {Object} track1 the first track object to compare
	 * @param {Object} track2 the second track object to compare
	 * 
	 * @returns {Boolean} true if the tracks are equal in all significant aspects.
	 */
	function areTracksEqual(track1, track2) {
		return ( 
			(track1 != null && track2 != null)
			&& (track1.title === track2.title)
			&& (track1.artist === track2.artist)
			&& (track1.album === track2.album)
			&& (track1.isPlaying === track2.isPlaying)
		);
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
	 * Forward a click event to Google Play Music's play-pause button.
	 */
	function playPauseTrack(){
		$(actions.play).click();
	}

	/**
	 * Forward a click event to Google Play Music's next track (forward) button.
	 */
	function nextTrack(){
		$(actions.forward).click();
		// focus on the duration to force update it
		$(trackInformation.duration).focus();
	}

	/**
	 * Forward a click event to Google Play Music's rewind button.
	 */
	function rewindTrack(){
		$(actions.rewind).click();
		// focus on the duration to force update it
		$(trackInformation.duration).focus();
	}

	// TODO: look into adding seek control, this would apply both here and on the controls html

	console.clear();

	// RACE CONDITION WAS CAUSING THIS TO NOT FIRE, PROBABLY BECAUSE THE BACKGROUND SCRIPT
	// WASN'T YET LOADED.  REFACTOR AND SEE IF THIS METHOD OF COMMUNICATION IS ALLOWED FROM
	// A BACKGROUND TASK.  ALSO CONSIDER REFACTORING THIS IN GENERAL TO MAKE IT EASIER FOR
	// THE BACKGROUND SCRIPT TO HANDLE INSTANCES WHERE THERE ARE MULITIPLE GOOGLE PLAY MUSIC
	// WINDOWS OPEN AND TO KNOW WHICN ONE IS ACTIVELY PLAYING MUSIC.
	var myPort;
	function setupBackgroundConnection(){
		myPort = browser.runtime.connect({name: "gpmusic"});
		myPort.onMessage.addListener( (message) => {
			console.log("message received: " + message.action);
			switch( message.action ) {
				case "update":			updateTrackData(true);			break;
				case "play-pause":		playPauseTrack();				break;
				case "next":			nextTrack();					break;
				case "rewind":			rewindTrack();					break;
				default:
					console.log(`unknown message received: ${message}`);
			}
		});
		myPort.onDisconnect.addListener( (e) =>{
			console.log("disconnected myPort");
		})
	}
	//TODO: setup a callback loop where this will keep executing until we get a response from the background script
	setTimeout(setupBackgroundConnection,1000);
	
	// Synchronize the current track information and setup an observer to 
	// listen for any changes and resynchronize.
	// The duration element updates every second
	updateTrackData(false);
	var songInfoObserver = new MutationObserver(updateTrackData);
	songInfoObserver.observe( $("#time_container_current"), {childList:true} );
})();