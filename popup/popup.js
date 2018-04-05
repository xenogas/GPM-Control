'use strict';

class Popup {
    constructor() {
        this.updateMiniPlayer();
        this.addControlEventListeners();
    }

    addControlEventListeners() {
        document.getElementById(Popup.PlayId) .addEventListener("click", this.play.bind(this));
        document.getElementById(Popup.PauseId).addEventListener("click", this.pause.bind(this));
        document.getElementById(Popup.RewindId).addEventListener("click", this.rewind.bind(this));
        document.getElementById(Popup.NextId).addEventListener("click", this.forward.bind(this));
        // document.getElementById(this.ThumbsUpId).addEventListener("click", this.thumbsUp);
        // document.getElementById(this.ThumbsDownId).addEventListener("click", this.thumbsDown);
        // document.getElementById(this.LuckyId).addEventListener("click", this.lucky);
    }

    /**
     * Update the popup mini-player's current track information and play state
     */
    updateMiniPlayer() {
        var background = browser.extension.getBackgroundPage();
        var track = background.currentTrack;
        // Update track info
        document.getElementById(Popup.TitleId).innerHTML = track.title;
		document.getElementById(Popup.AlbumId).innerHTML = track.album;
		document.getElementById(Popup.ArtistId).innerHTML = track.artist;
        document.getElementById(Popup.ArtId).src = track.artwork;
        
        // Update Progress
		this.updateProgress(track);

        var player = background.currentPlayer;
        this.setPlayPauseControl(player.isPlaying);
        
        // wait a second and then update again
        setTimeout(this.updateMiniPlayer.bind(this), 1000);
    }

    /**
     * Update the progress indication including time and percentage bar.
     * @param {Object} track contains all the information regarding the current track
     */
    updateProgress(track) {
        // Split the progress and duration into parts
        var p = track.progress.split(':');
        p = parseInt(p[0]) * 60 + parseInt(p[1]);
        var d = track.duration.split(':');
        d = parseInt(d[0]) * 60 + parseInt(d[1]);

        // Update progress percentage, make sure it doesn't exceed 100%
        var progress = Math.min(p / d * 100, 100);
        document.getElementById(Popup.ProgressBar).setAttribute('style', `width:${progress}%`);

        // If the progress has exceeded the duration, we're at the end of the track.
        // Match the progress to the durration to avoid odd display issues
        if( p > d ) track.progress = track.duration;

        // Update the progress / duration indicators
        progress = `${track.progress} / ${track.duration}`;
        document.getElementById(Popup.ProgressId).innerHTML = progress;
    }

    play() {
        this.sendAction(Message.Type.Play);
        this.setPlayPauseControl(true);
    }
    pause() {
        this.sendAction(Message.Type.Pause);
        this.setPlayPauseControl(false);
    }
    rewind() {
        this.sendAction(Message.Type.Rewind);
    }
    forward() {
        this.sendAction(Message.Type.Forward);
    }

    /**
     * Toggles the display of the Play | Pause buttons to reflect the current
     * available action.
     * @param {Boolean} isPlaying true if media is currently playing
     */
    setPlayPauseControl(isPlaying) {
        if( isPlaying ) {
            document.getElementById(Popup.PlayId).classList.add("hidden");
            document.getElementById(Popup.PauseId).classList.remove("hidden");
        }else{
            document.getElementById(Popup.PauseId).classList.add("hidden");
            document.getElementById(Popup.PlayId).classList.remove("hidden");
        }
        // Make sure the current player is updated immediately since the page won't
        // update it until the next tick.
        browser.extension.getBackgroundPage().currentPlayer.isPlaying = isPlaying;
    }

    /**
     * Send a message to the currently active GPM tab that the specified action has occured.
     * @param {Message.Type} action type of action that has occured
     */
    sendAction(action) {
        // console.log(`sending action: ${action}`);
        var player = browser.extension.getBackgroundPage().currentPlayer;
        if( player.id != -1 ) {
            browser.tabs.sendMessage(player.id, {type: action});
        }
    }

    /**
     * Keeps the Google Play Music tab active so that we continue to receive realtime updates.
     * This is a hack to get around the UI update throttling imposed by the browser when a
     * tab becomes inactive.
     */
    async keepGPMAlive() {
        // Find Google Play Music
        var tabs = await browser.tabs.query({url: '*://play.google.com/*'});
        // Take the tabs and find the current active tab for each window
        for( var tab of tabs ) {
            // find the currently active tab
            var activeTab = await browser.tabs.query({windowId: tab.windowId, active:true});
            // set the google play tab as active
            await browser.tabs.update(tab.id, {active:true});
            // set the current tab as active
            await browser.tabs.update(activeTab[0].id, {active:true});
            // todo - to address when accounting for multiple GPM tabs
            browser.extension.getBackgroundPage().currentPlayer.id = tab.id;
        }

        setTimeout(this.keepGPMAlive.bind(this), 1000);
    }

    // References the popup HTML's DOM structure for track information
    static get ArtId() { return "current-artwork"; }
	static get TitleId() { return "current-title"; }
	static get ArtistId() { return "current-artist"; }
	static get AlbumId() { return "current-album"; }
    static get ProgressId() { return "current-progress"; }
    static get ProgressBar() { return 'primary-progress'; }
    
    // References the popup HTML's DOM structure for media controls
    static get PlayId() { return "play"; }
	static get PauseId() { return "pause"; }
	static get NextId() { return "next"; }
    static get RewindId() { return "rewind"; }
}

// Create a new popup
var popup = new Popup();
popup.keepGPMAlive();