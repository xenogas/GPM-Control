(function(){
	// Ensure this script only runs once
	if( window.gpmusicHasRun ) { return; }
	window.gpmusicHasRun = true;

	// Shorthand for querying DOM elements
	var $ = document.querySelector.bind(document);

	// Manages the google play music controls
	var controls = new Control();
	
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
		var hasTrackChanged = !track.equals(lastTrack);

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
	function getTrackData() {
		var title = $(Track.TitleId).innerHTML;
		var artist = $(Track.ArtistId).innerHTML;
		var album = $(Track.AlbumId).innerHTML;
		var art = $(Track.ArtworkId).src;
		art = art.substring(0, art.indexOf("="));
		var progress = $(Track.ProgressId).innerHTML;
		var duration = $(Track.DurationId).innerHTML;

		var track = new Track(title, artist, album, art, progress, duration);
		//todo - move this away from the track and into some other setting
		track.isPlaying = controls.isPlaying();
		
		return track;
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
				case "play-pause":		controls.play();				break;
				case "next":			controls.next();				break;
				case "rewind":			controls.rewind();				break;
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