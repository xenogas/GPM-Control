(function() {
	// Ensure script only runs once
	if( window.totumiter && window.totumiter.isLoaded ) {
		console.log('content scripts already loaded, exiting');
		return;
	}
	window.totumiter = window.totumiter || {};
	window.totumiter.isLoaded = true;

	/**
	 * Inject scripts into the page with a provided id and src
	 * 
	 * @param {String} src path to the source file
	 */
	function injectScript(src) {
		var s = document.createElement('script');
		s.src = browser.extension.getURL(src);
		(document.head || document.documentElement).appendChild(s);
	}

	// Create a control to process action requests
	var player = new MediaControl();

	// Setup system to notify background script of track changes
	injectScript('track.js');
	injectScript('media-player.js');
	injectScript('injected.js');
})();