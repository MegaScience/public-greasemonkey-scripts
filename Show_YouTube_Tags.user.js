// ==UserScript==
// @name        Show Youtube Tags
// @namespace   https://www.youtube.com/
// @description Adds tags for the current video to the video description, as the website previously offered. Currently, tags are buried in the page code.
// @match       *://*.youtube.com/*
// @noframes
// @version     1.4
// ==/UserScript==

console.log("Show YouTube Tags: Loaded.");
var information = {
	debug: false,
	echoTypes: ["", "Error - ", "Warning - "]
};

function appendTags() {
	var data = errorCheckTags();
	if(data.errState > 0) {
		tagLog({string: data.errState + " errors. Tag addition canceled.", type: 2, debug: true});
		return;
	}
	var tags = data.keywords.replace(/,/g, ", ") || "-",
		li = data.meta.cloneNode(true);
	li.id = "showYouTubeTags";
	li.getElementsByTagName('h4')[0].innerHTML = " Tags ";
	li.getElementsByTagName('li')[0].innerHTML = tags;
	data.container.appendChild(li);
	tagLog({string: "Tags added.", type: 0, debug: false});
}

function errorCheckTags() {
	var data = { errState: 0 };
	if(location.pathname !== "/watch") {
		tagLog({string: "Non-video Page: " + location.pathname, type: 2, debug: true});
		data.errState++;
	}
	else {
		if(isFrame()) {
			tagLog({string: "Script running in incorrect scope.", type: 2, debug: false});
			data.errState++;
		}
		else {
			if(document.getElementById('showYouTubeTags')) {
				tagLog({string: "Tags already added. Avoiding adding taglist twice.", type: 2, debug: false});
				data.errState++;
			}
			else {
				data.keywords = confirmObject(["ytplayer", "config", "args", "keywords"]);
				if(typeof data.keywords === 'boolean') {
					tagLog({string: "Object unable to be located.", type: 1, debug: true});
					data.errState++;
				}

				data.container = document.getElementsByClassName('watch-extras-section')[0];
				if(data.container === null) {
					tagLog({string: "Could not locate required description area.", type: 1, debug: false});
					data.errState++;
				}
				else {
					data.meta = data.container.lastElementChild;
					if(data.meta.querySelector("h4") === null || data.meta.querySelector("li") === null) {
						tagLog({string: "Description area format changed.", type: 1, debug: false});
						data.errState++;
					}
				}
			}
		}
	}

	tagLog({string: "Sending required data.", type: 0, debug: true});
	return data;
}

function confirmObject(array) {
	var tempObject = window;
	for(var i = 0, len = array.length; i < len; i++) {
		if(tempObject[array[i]] === undefined) {
			tagLog({string: "Could not locate object property: " + array.slice(0, (i + 1)).join("."), type: 1, debug: false});
			return false;
		}
		tempObject = tempObject[array[i]];
	}
	return tempObject;
}

function tagLog(data) {
	if(data.debug && !information.debug) return;
	data.string = "Show YouTube Tags" + (data.debug ? " [Debug]" : "") + ": " + information.echoTypes[data.type] + data.string;
	switch(data.method || 1) {
		case 2:
			alert(data.string);
			return true;
		//case 1:
		default:
			console.log(data.string);
			return true;
	}
	return false;
}

function isFrame() {
	return window.frameElement || window.top !== window.self;
}

if(!isFrame()) {
	window.addEventListener('readystatechange', appendTags, true);
	window.addEventListener('spfdone', appendTags);
}
else {
	tagLog({string: "Only applying listeners to top-level scope.", type: 2, debug: true});
}
