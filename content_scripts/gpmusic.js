// Google Play Actions
var actions = {
    play: "#player-bar-play-pause",
    forward: "#player-bar-forward",
    rewind: "player-bar-rewind",
    lucky: "#iflFab",
    luckyRefresh: "[data id-'refresh']",
    thumbsUp: ".now-playing-actions [icon='sj:thumb-up-outline']",
    thumbsDown: ".now-playing-actions [icon='sj:thumb-down-outline']"
};
// Track Information
var information = {
    currentTrack: {
        title: "#currently-playing-title",
        artwork: "#playerBarArt", // Possibly adjust this so that we get a larger piece of art
        artist: "#player-artist",
        album: "#player-album",
        duration: "#time_container_duration",
        progress: "#time_container_current"
    }
    //TODO: address the queue container
    //queue: "#queueContainer"
};

