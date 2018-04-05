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

    updateMiniPlayer() {
        var track = browser.extension.getBackgroundPage().currentTrack;
        document.getElementById(Popup.TitleId).innerHTML = track.title;
		document.getElementById(Popup.AlbumId).innerHTML = track.album;
		document.getElementById(Popup.ArtistId).innerHTML = track.artist;
		document.getElementById(Popup.ArtId).src = track.artwork;
		var progress = `${track.progress} / ${track.duration}`;
        document.getElementById(Popup.ProgressId).innerHTML = progress;

        this.setPlayPauseControl(true);
        
        // wait a second and then update again
        setTimeout(this.updateMiniPlayer.bind(this), 1000);
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
    setPlayPauseControl(isPlaying) {
        if( isPlaying ) {
            document.getElementById(Popup.PlayId).classList.add("hidden");
            document.getElementById(Popup.PauseId).classList.remove("hidden");
        }else{
            document.getElementById(Popup.PauseId).classList.add("hidden");
            document.getElementById(Popup.PlayId).classList.remove("hidden");
        }
    }

    sendAction(action) {
        console.log(`sending action: ${action}`);
        var player = browser.extension.getBackgroundPage().currentPlayer;
        if( player != -1 ) {
            browser.tabs.sendMessage(player, {type: action});
        }
    }

    // References the popup HTML's DOM structure for track information
    static get ArtId() { return "current-artwork"; }
	static get TitleId() { return "current-title"; }
	static get ArtistId() { return "current-artist"; }
	static get AlbumId() { return "current-album"; }
    static get ProgressId() { return "current-progress"; }
    
    // References the popup HTML's DOM structure for media controls
    static get PlayId() { return "play"; }
	static get PauseId() { return "pause"; }
	static get NextId() { return "next"; }
    static get RewindId() { return "rewind"; }
}

// Create a new popup
var popup = new Popup();