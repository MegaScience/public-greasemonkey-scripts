// ==UserScript==
// @name        YouTube Prevent Playlist Autoplay
// @description YouTube decided playlists should ALWAYS play the next video at the end of the current video, removing the choice from the user. As I wait until the end of the video to comment, this seemed idiotic, so this code should prevent that.
// @include     /^https?:\/\/(www.)?youtube\.com\/.*$/
// @exclude     /^https?:\/\/(www.)?youtube\.com\/embed\/.*$/
// @version     0.9
// @noframes
// ==/UserScript==

const primary = function () {
    // TODO: Make an in-page button to toggle the below variable.
    let autoplayOn = false

    function getManager() {
        const [manager] = document.getElementsByTagName('yt-playlist-manager')
        return manager
    }

    // In the new layout, playlists cannot autoplay if this "canAutoAdvance_" variable is set to "false"
    // Toggling it back manually is messy (it switches back for countless reasons)
    // Luckily, it is set to "true" via a function whose sole purpose is to do so.
    // Just replace that function and you control autoplay on playlists!
    function main() {
        const manager = getManager()
        if (manager && !manager.interceptedForAutoplay) {
            manager.interceptedForAutoplay = true
            manager.onYtNavigateFinish_ = function () { this.canAutoAdvance_ = autoplayOn }
        }
        else console.log(`Playlist autoplay is ${manager?.interceptedForAutoplay ? 'already intercepted' : 'still enabled'}.`)
    }
    window.addEventListener('yt-playlist-data-updated', main, { once: true })
    window.addEventListener('yt-page-type-changed', main)
}

const script = document.createElement('script');
script.appendChild(document.createTextNode(`(${primary})()`));
(document.body || document.head || document.documentElement).appendChild(script)

// Below this point is the old code for the previous YouTube layout. It is no longer relevant since Youtube began aggressively preventing access to it.

// CREDIT: Yonezpt (Github) wrote most of the below code. I only made slight adjustments. Original code found here: https://github.com/YePpHa/YouTubeCenter/issues/1192#issuecomment-68611967
// Notice: Occasionally you will still get moved to the next video. I assume this is because YouTube instates a limit on SPF page changes before doing a full page change to clear the cache. If you know where the code for that is, feel free to suggest an update to this.
/*
// @run-at      document-idle
const primary = function() {
	window.user_wants_autoplay = false;
	function autoplayDetour(b) {
		return function (x, y, z) {
			let button = document.querySelector('.toggle-loop, .toggle-autoplay');
			if(button !== null)
				window.user_wants_autoplay = button.classList.contains('yt-uix-button-toggled');
			if(window.user_wants_autoplay || (!window.user_wants_autoplay && (!y || y.feature && y.feature !== 'autoplay'))) {
				b.apply(this, arguments);
			}
			else console.log('Prevent Autoplay: ' + JSON.stringify(arguments));
		};
	}

	let flag = false;
	let prop = window._yt_www ? '_yt_www' : window._yt_player ? '_yt_player' : false;
	if(prop !== false) {
		flag = Object.keys(window[prop]).some(function (b) {
			if(typeof window[prop][b] === 'function' && window[prop][b].toString().indexOf('window.spf.navigate') !== -1) {
				console.log('Prevent Autoplay: Encapsulating SPF Navigation. (Function Arguments: ' + window[prop][b].length + ')');
				window[prop][b] = autoplayDetour(window[prop][b]);
				return true;
			}
		});
	}
	else console.log('Prevent Autoplay: YouTube script not found. Format changed.');
	
	if(!flag && typeof window.yt.player.exports.navigate !== 'undefined') {
		window.yt.player.exports.navigate = autoplayDetour(window.yt.player.exports.navigate);
		flag = true;
	}
	
	if(!flag && typeof window.spf.navigate !== 'undefined') {
		window.spf.navigate = autoplayDetour(window.spf.navigate);
		flag = true;
	}

	if(!flag) alert('Prevent Autoplay: Could not locate SPF navigation in YouTube code.');
};

const script = document.createElement('script');
script.appendChild(document.createTextNode('('+ primary +')();'));
(document.body || document.head || document.documentElement).appendChild(script);
*/
