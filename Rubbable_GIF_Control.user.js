// ==UserScript==
// @name        Control Gif
// @namespace   https://www.example.com/
// @description When you open a .gif as a page, this will give you the option to make it click-drag controlable.
// @include     /^https?:\/\/[^/]+\/[^?#&]+\.gif([#?].*)?$/
// @version     1.1
// @require     https://cdn.rawgit.com/buzzfeed/libgif-js/master/libgif.js
// @require     https://cdn.rawgit.com/buzzfeed/libgif-js/master/rubbable.js
// @run-at      document-idle
// @noframes
// @grant       GM_addStyle
// ==/UserScript==

// Library: https://github.com/buzzfeed/libgif-js
// Example: https://rawgit.com/buzzfeed/libgif-js/master/example.html

const gifControl = {
	init: function () {
		if(!confirm("GIF Detected. Control it?"))
			return;

		try {
			let origIMG = document.getElementsByTagName("img")[0];
			let style = window.getComputedStyle(origIMG, null);
			this.theNewGIF = new RubbableGif({
				gif: origIMG
			});
			this.theNewGIF.load(function() {
				console.log('GIF Finished Loading into the Canvas Stuff.');
			});
			this.applyIMGStyles(style, this.theNewGIF.get_canvas());
		}
		catch (e) {
			alert(e.message);
		}
	},
	applyIMGStyles: function (s, e) {
		let c = s => s.replace(/-([a-z])/gi, (m, p1) => p1.toUpperCase());
		// Adapted from: http://stackoverflow.com/questions/22907735/get-the-computed-style-and-omit-defaults
		let d = document.createElement('element-' + (new Date().getTime()));
		document.body.appendChild(d);
		let dS = window.getComputedStyle(d, null);
		for (let k of s) {
			let v = s.getPropertyValue(k);
			if(dS.getPropertyValue(k) !== v)
				e.style[c(k)] = v;
		}

		d.remove();
	}
};

if(document.querySelector('body > *:only-child > img, body > img:only-child') !== null)
	gifControl.init();
