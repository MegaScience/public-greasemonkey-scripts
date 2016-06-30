// ==UserScript==
// @name        Show Youtube Tags
// @namespace   https://www.youtube.com/
// @description Adds tags for the current video to the video description, as the website previously offered. Currently, tags are buried in the page code.
// @match       *://*.youtube.com/*
// @noframes
// @version     2.0
// ==/UserScript==

console.log("Show YouTube Tags: Loaded.");
var information = {
	debug: false,
	echoTypes: ["", "Error - ", "Warning - "],
	messages: {
		loaded: {string: "Loaded.", type: 0, debug: false},
		error: {string: "Tag addition canceled due to error(s).", type: 2, debug: true},
		added: {string: "Tags added.", type: 0, debug: false},
		wrongPage: {string: "Non-video Page: ", type: 2, debug: true},
		iFrame: {string: "Script running in incorrect scope.", type: 2, debug: false},
		exists: {string: "Tags already added. Avoiding adding taglist twice.", type: 2, debug: false},
		objMiss: {string: "Object unable to be located.", type: 1, debug: true},
		descMiss: {string: "Could not locate required description area.", type: 1, debug: false},
		descChan: {string: "Description area format changed.", type: 1, debug: false},
		returning: {string: "Sending required data.", type: 0, debug: true},
		objProp: {string: "Could not locate object property: ", type: 1, debug: false},
		iFrameOut: {string: "Only applying listeners to top-level scope.", type: 2, debug: true}
	}
};

function appendTags() {
	var data = errorCheckTags();
	if(data.errState) {
		tagLog("error");
		return;
	}
	var tags = data.keywords.replace(/,/g, ", ") || "-",
		li = data.meta.cloneNode(true);
	li.id = "showYouTubeTags";
	li.getElementsByTagName("h4")[0].innerHTML = " Tags ";
	li.getElementsByTagName("li")[0].innerHTML = tags;
	data.container.appendChild(li);
	tagLog("added");
}

function errorCheckTags() {
	var data = { errState: false };
	try {
		if(location.pathname !== "/watch")
			throw new Error(["wrongPage", location.pathname]);
		if(isFrame())
			throw new Error("iFrame");
		if(document.getElementById("showYouTubeTags"))
			throw new Error("exists");
		data.keywords = confirmObject(["ytplayer", "config", "args", "keywords"]);
		if(typeof data.keywords === "boolean")
			throw new Error("objMiss");
		data.container = document.getElementsByClassName("watch-extras-section")[0];
		if(data.container === null)
			throw new Error("descMiss");
		data.meta = data.container.lastElementChild;
		if(data.meta.getElementsByTagName("h4") === 0 || data.meta.getElementsByTagName("li") === 0)
			throw new Error("descChan");
	}
	catch(e) {
		tagLog(e.message);
		data.errState = true;
	}
	finally {
		tagLog("returning");
		return data;
	}
}

function confirmObject(array) {
	var tempObject = window;
	for(var i = 0, len = array.length; i < len; i++) {
		if(tempObject[array[i]] === undefined) {
			tagLog("objProp", array.slice(0, (i + 1)).join("."));
			return false;
		}
		tempObject = tempObject[array[i]];
	}
	return tempObject;
}

function tagLog(message, append) {
	var data = message;
	if(typeof message === "string") {
		var split = message.split(",", 2);
		data = information.messages[split[0]];
		if(split.length > 1)
			append = split[1];
	}
	if(data.debug && !information.debug) return;
	var string = "Show YouTube Tags" + (data.debug ? " [Debug]" : "") + ": " + information.echoTypes[data.type] + data.string + (append === undefined ? "" : append);
	switch(data.method || 1) {
		case 2:
			alert(string);
			return true;
		//case 1:
		default:
			console.log(string);
			return true;
	}
	return false;
}

function isFrame() {
	return window.frameElement || window.top !== window.self;
}

if(!isFrame()) {
	window.addEventListener("readystatechange", appendTags, true);
	window.addEventListener("spfdone", appendTags);
}
else {
	tagLog("iFrameOut");
}
