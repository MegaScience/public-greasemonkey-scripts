// ==UserScript==
// @name        YouTube Playlist Autoplay Preventer
// @description YouTube decided playlists should ALWAYS play the next video at the end of the current video, removing the choice from the user. As I wait until the end of the video to comment, this seemed idiotic, so this code should prevent that.
// @include     /^https?:\/\/(www.)?youtube\.com\/.*$/
// @exclude     /^https?:\/\/(www.)?youtube\.com\/embed\/.*$/
// @version     0.6
// @noframes
// @run-at      document-end
// ==/UserScript==

// CREDIT: Yonezpt (Github) wrote most of the below code. I only made slight adjustments. Original code found here: https://github.com/YePpHa/YouTubeCenter/issues/1192#issuecomment-68611967
// Notice: Occasionally you will still get moved to the next video. I assume this is because YouTube instates a limit on SPF page changes before doing a full page change to clear the cache. If you know where the code for that is, feel free to suggest an update to this.

window.user_wants_autoplay = false;

(function() {
	function autoplayDetour(b) {
		return function () {
			var button = document.getElementsByClassName("toggle-loop") || document.getElementsByClassName("toggle-autoplay");
			if(button.length && button[0])
				window.user_wants_autoplay = button[0].classList.contains("yt-uix-button-toggled");
			if((!window.user_wants_autoplay && (!arguments[1] || arguments[1].feature && arguments[1].feature !== 'autoplay')) || window.user_wants_autoplay) {
				b.apply(this, arguments);
			}
		};
	}

	Object.keys(window._yt_www).some(function (b) {
		if(typeof window._yt_www[b] === 'function' && window._yt_www[b].toString().indexOf('window.spf.navigate') !== -1) {
			//console.log("It works!");
			window._yt_www[b] = autoplayDetour(window._yt_www[b]);
			return true;
		}
	});
})();
