// ==UserScript==
// @name        Show Youtube Video Tags
// @namespace   https://www.youtube.com/
// @description Adds tags for the current video to the video description, as the website previously offered. Currently, tags are buried in the page code.
// @match       *://*.youtube.com/*
// @noframes
// @version     3.0
// @grant       none
// ==/UserScript==

var showYTT = {
	debug: false,
	echoTypes: ["", "Error - ", "Warning - "],
	messages: {
		loaded: {string: "Loaded.", type: 0, debug: false},
		error: {string: "Tag addition will cancel due to error(s).", type: 2, debug: true},
		added: {string: "Tags added.", type: 0, debug: false},
		wrongPage: {string: "Non-video Page: ", type: 2, debug: true},
		iFrame: {string: "Script running in incorrect scope.", type: 2, debug: false},
		exists: {string: "Tags already added. Avoiding adding taglist twice.", type: 2, debug: false},
		//objMiss: {string: "Object unable to be located.", type: 1, debug: true},
		descMiss: {string: "Could not locate required description area.", type: 1, debug: false},
		descChan: {string: "Description area format changed.", type: 1, debug: false},
		returning: {string: "Sending required data.", type: 0, debug: true},
		objProp: {string: "Could not locate object property: ", type: 1, debug: false},
		iFrameOut: {string: "Only applying listeners to top-level scope.", type: 2, debug: true}
	},
	addTags: function () {
		var data = this.errorCheck();
		if(data.errState) return;
		var tags = data.keywords.replace(/,/g, ", ") || "-",
			li = data.meta.cloneNode(true);
		li.id = "showYouTubeTags";
		li.getElementsByTagName("h4")[0].innerHTML = " Tags ";
		li.getElementsByTagName("li")[0].innerHTML = tags;
		data.container.appendChild(li);
		this.tagLog("added");
	},
	errorCheck: function () {
		var data = { errState: false };
		try {
			if(location.pathname !== "/watch")
				throw ["wrongPage", location.pathname];
			if(this.isFrame())
				throw "iFrame";
			if(document.getElementById("showYouTubeTags"))
				throw "exists";
			data.keywords = this.confirmObject(["ytplayer", "config", "args", "keywords"]);
			if(typeof data.keywords === "boolean")
				throw false;
			data.container = document.getElementsByClassName("watch-extras-section")[0];
			if(data.container === null)
				throw "descMiss";
			data.meta = data.container.lastElementChild;
			if(data.meta.getElementsByTagName("h4").length === 0 || data.meta.getElementsByTagName("li").length === 0)
				throw "descChan";
		}
		catch(e) {
			if(Array.isArray(e))
				this.tagLog(e[0], e[1]);
			else if(e !== false)
				this.tagLog(e);
			data.errState = true;
			this.tagLog("error");
		}
		finally {
			this.tagLog("returning");
			return data;
		}
	},
	confirmObject: function (array) {
		var tempObject = window;
		for(var i = 0, len = array.length; i < len; i++) {
			if(tempObject[array[i]] === undefined) {
				this.tagLog("objProp", array.slice(0, (i + 1)).join("."));
				return false;
			}
			tempObject = tempObject[array[i]];
		}
		return tempObject;
	},
	tagLog: function (message, append) {
		var data = (typeof message === "string" ? this.messages[message] : message);
		if(data.debug && !this.debug) return;
		var string = "Show YouTube Tags" + (data.debug ? " [Debug]" : "") + ": " + this.echoTypes[data.type] + data.string + (typeof append === "undefined" ? "" : append);
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
	},
	isFrame: function () {
		return window.frameElement || window.top !== window.self;
	}
};

showYTT.tagLog("loaded");

if(!showYTT.isFrame()) {
	window.addEventListener("readystatechange", function () { showYTT.addTags(); }, true);
	window.addEventListener("spfdone", function () { showYTT.addTags(); });
}
else {
	showYTT.tagLog("iFrameOut");
}
