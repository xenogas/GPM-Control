'use strict';

class Track {
    constructor(title, artist, album, artwork, progress, duration, thumbsUp, thumbsDown) {
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.artwork = artwork;
        this.progress = progress;
        this.duration = duration;
        this.thumbsUp = thumbsUp;
        this.thumbsDown = thumbsDown;

        // Set creation and update time to now
        var date = new Date();
        this.creationTime = date;
        this.updateTime = date;
    }

    /**
     * Compares this track with another to determine if they are the same
     * or different tracks.  Note that this does not compare the current
     * progress of the tracks.
     * 
     * @param {Object} track an instance of a Track object
     * @returns True if the two tracks are the same
     */
    equals(track) {
        return ( track != null &&
            this.title == track.title &&
            this.artist == track.artist &&
            this.album == track.album
        );
    }

    // DOM IDs for the associated elements
    static get TitleId() { return "#currently-playing-title"; }
    static get ArtworkId() { return "#playerBarArt"; }
    static get ArtistId() { return "#player-artist"; }
    static get AlbumId() { return ".player-album"; }
    static get DurationId() { return "#time_container_duration"; }
    static get ProgressId() { return "#time_container_current"; }
	static get ThumbsUpId() { return ".now-playing-actions [icon='sj:thumb-up-outline']"; }
	static get ThumbsDownId() { return ".now-playing-actions [icon='sj:thumb-down-outline']"; }
    static isRatingSelected(rating) {
        return rating.title.toLowerCase().indexOf('undo') > -1;
    }
}