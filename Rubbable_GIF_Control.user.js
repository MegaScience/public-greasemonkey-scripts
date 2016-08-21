// ==UserScript==
// @name        Rubbable GIF Control
// @namespace   https://www.example.com/
// @description When you open a .gif as a page, this will give you the option to make it click-drag controlable.
// @include     /^https?:\/\/[^/]+\/[^?#]+\.gif([#?].*)?$/
// @version     1
// @require     https://cdn.rawgit.com/buzzfeed/libgif-js/master/libgif.js
// @require     https://cdn.rawgit.com/buzzfeed/libgif-js/master/rubbable.js
// @run-at      document-idle
// @grant       none
// ==/UserScript==

// Library: https://github.com/buzzfeed/libgif-js
// Example: https://rawgit.com/buzzfeed/libgif-js/master/example.html

var gifControl = {
	initiate: function () {
		if(!confirm("GIF Detected. Control it?"))
			return;

		try {
			var origIMG = document.getElementsByTagName("img")[0],
				style = window.getComputedStyle(origIMG, null),
				background = style.getPropertyValue("background"),
				color = style.getPropertyValue("color");
			this.theNewGIF = new RubbableGif({
				gif: origIMG
			});
			this.theNewGIF.load(function() {
				console.log('GIF Finished Loading into the Canvas Stuff.');
			});
			this.style = this.applyIMGStyles(style, this.theNewGIF.get_canvas());
		} catch (e) {
		  alert(e.message);
		}
	},
	applyIMGStyles: function (style, elem) {
		// Adapted from: http://stackoverflow.com/questions/22907735/get-the-computed-style-and-omit-defaults
		var dummy = document.createElement('element-' + (new Date().getTime()));
		document.body.appendChild(dummy);
		var defStyle = getComputedStyle(dummy, null),
			styleApp = [],
			styleOut = {};
		for(var i = 0, len = style.length, key, value; i < len; i++) {
			key = style[i], value = style.getPropertyValue(key);
			if(defStyle.getPropertyValue(defStyle[i]) !== value) {
				styleApp.push(key + ": " + value + ";");
				styleOut[key] = value;
			}
		}

		elem.setAttribute("style", styleApp.join(" "));
		dummy.remove();
		
		return styleOut;
	}
};

gifControl.initiate();
