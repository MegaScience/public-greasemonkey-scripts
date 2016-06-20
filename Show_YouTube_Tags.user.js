// ==UserScript==
// @name        Show Youtube Tags
// @namespace   https://www.youtube.com/
// @description Adds tags for the current video to the video description, as the website previously offered. Currently, tags are buried in the page code.
// @include     *://www.youtube.com/*
// @version     1.3
// ==/UserScript==

console.log("Show YouTube Tags: Loaded.");
var information = {
	debug: false,
	echoTypes: ["", "Error - ", "Warning - "]
};

function appendTags() {
	var checkReturn = errorCheckTags();
	//if(errorCheckTags() > 0) return;
	if(typeof checkReturn === 'number') return;
	//var listObj = document.getElementsByClassName('watch-extras-section')[0];
	//var tags = ytplayer.config.args.keywords.replace(/,/g, ', ') || "-";
	var tags = checkReturn.keywords.replace(/,/g, ", ") || "-";
	//var li = listObj.children[listObj.children.length - 1].cloneNode(true);
	var li = checkReturn.meta.cloneNode(true);
	li.id = "showYouTubeTags";
	li.getElementsByTagName('h4')[0].innerHTML = " Tags ";
	li.getElementsByTagName('li')[0].innerHTML = tags;
	checkReturn.container.appendChild(li);
	tagLog("Tags added.");
}

function errorCheckTags() {
	var errorState = 0,
		output = {};
	if(location.pathname !== "/watch") {
		tagLog({string: "Incorrect webpage: " + location.pathname, type: 2, debug: true});
		errorState++;
	}
	else {
		if(isFrame()) {
			tagLog({string: "Script running outside of scope: " + window.self, type: 2, debug: false});
			errorState++;
		}
		else {
			if(document.getElementById('showYouTubeTags')) {
				tagLog({string: "Avoiding adding taglist twice.", type: 1, debug: false});
				errorState++;
			}
			else {
				output.keywords = confirmObject(["ytplayer", "config", "args", "keywords"]);
				if(typeof output.keywords === 'boolean') {
					tagLog({string: "Object locating failed.", type: 1, debug: true});
					errorState++;
				}

				output.container = document.getElementsByClassName('watch-extras-section')[0];
				if(output.container == null) {
					tagLog({string: "Could not locate proper description area.", type: 1, debug: false});
					errorState++;
				}
				else {
					output.meta = output.container.lastElementChild;
					if(!output.meta.querySelector("h4") || !output.meta.querySelector("li")) {
						tagLog({string: "Description area format changed.", type: 1, debug: false});
						errorState++;
					}
				}
			}
		}
	}

	if(errorState > 0) {
		tagLog({string: errorState + " errors.", type: 2, debug: true});
		return errorState;
	}
	else {
		tagLog({string: "Sending object list.", type: 2, debug: true});
		return output;
	}
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
	data.string = "Show YouTube Tags: " + information.echoTypes[data.type] + data.string;
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
	tagLog({string: "Only applying listeners to top-level.", type: 2, debug: true});
}
