'use strict';

class Popup {
    constructor() {
        // this.playState = browser.extension.getBackgroundPage();
        this.updateTrack();
    }

    updateTrack() {
        // var track = this.playState.currentTrack;
        var track = browser.extension.getBackgroundPage().currentTrack;
        document.getElementById(Popup.TitleId).innerHTML = track.title;
		document.getElementById(Popup.AlbumId).innerHTML = track.album;
		document.getElementById(Popup.ArtistId).innerHTML = track.artist;
		document.getElementById(Popup.ArtId).src = track.artwork;
		var progress = `${track.progress} / ${track.duration}`;
        document.getElementById(Popup.ProgressId).innerHTML = progress;
        
        // wait a second and then update again
        setTimeout(this.updateTrack.bind(this), 1000);
    }

    // References the popup HTML's DOM structure for track information
    static get ArtId() { return "current-artwork"; }
	static get TitleId() { return "current-title"; }
	static get ArtistId() { return "current-artist"; }
	static get AlbumId() { return "current-album"; }
	static get ProgressId() { return "current-progress"; }
}

// Create a new popup
var popup = new Popup();