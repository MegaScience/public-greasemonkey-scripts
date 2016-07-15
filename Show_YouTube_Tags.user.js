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
	echoType: ["log", "error", "warn"],
	logString: "Show YouTube Tags%s: %s%s",
	messages: {
		loaded: {type: 0, debug: false, string: "Loaded."},
		error: {type: 2, debug: true, string: "Tag addition will cancel due to error(s)."},
		added: {type: 0, debug: false, string: "Tags added. "},
		wrongPage: {type: 2, debug: true, string: "Non-video Page: "},
		iFrame: {type: 2, debug: false, string: "Script running in incorrect scope."},
		exists: {type: 2, debug: false, string: "Tags already added. Avoiding adding taglist twice."},
		//objMiss: {type: 1, debug: true, string: "Object unable to be located."},
		descMiss: {type: 1, debug: false, string: "Could not locate required description area."},
		descChan: {type: 1, debug: false, string: "Description area format changed."},
		returning: {type: 0, debug: true, string: "Sending required data."},
		objProp: {type: 1, debug: false, string: "Could not locate object property: "},
		iFrameOut: {type: 2, debug: true, string: "Only applying listeners to top-level scope."},
		unknownIssue: {type: 2, debug: true, string: "Unaccounted issue: "}
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
		this.tagLog(this.messages.added, "(" + data.video_id + ")");
		if(!this.debug) return;
		this.tagLog({type: 0, debug: false, string: "Testing..."});
		this.tagLog(this.messages.error);
		this.tagLog(this.messages.descMiss);
		this.tagLog(this.messages.returning);
	},
	errorCheck: function () {
		var data = { errState: false };
		try {
			if(location.pathname !== "/watch")
				throw [this.messages.wrongPage, location.pathname];
			if(this.isFrame())
				throw this.messages.iFrame;
			if(document.getElementById("showYouTubeTags"))
				throw this.messages.exists;
			data.keywords = this.confirmObject(["ytplayer", "config", "args", "keywords"]);
			if(typeof data.keywords === "boolean")
				throw false;
			data.container = document.getElementsByClassName("watch-extras-section")[0];
			if(data.container === null)
				throw this.messages.descMiss;
			data.meta = data.container.lastElementChild;
			if(data.meta.getElementsByTagName("h4").length === 0 || data.meta.getElementsByTagName("li").length === 0)
				throw this.messages.descChan;
			data.video_id = this.confirmObject(["ytplayer", "config", "args", "video_id"]);
			if(typeof data.video_id === "boolean")
				data.video_id = "ID Not Found";
		}
		catch(e) {
			data.errState = true;
			if(typeof e.message !== "undefined")
				this.tagLog(this.messages.unknownIssue, e.message);
			else if(Array.isArray(e))
				this.tagLog(e[0], e[1]);
			else if(e !== false)
				this.tagLog(e);
			this.tagLog(this.messages.error);
		}
		finally {
			this.tagLog(this.messages.returning);
			return data;
		}
	},
	confirmObject: function (array) {
		var tempObject = window;
		for(var i = 0, len = array.length; i < len; i++) {
			if(typeof tempObject[array[i]] === "undefined") {
				this.tagLog(this.messages.objProp, array.slice(0, (i + 1)).join("."));
				return false;
			}
			tempObject = tempObject[array[i]];
		}
		return tempObject;
	},
	tagLog: function (message, append) {
		var data = (typeof message === "string" ? this.messages[message] : message);
		if(data.debug && !this.debug) return false;
		console[this.echoType[data.type]](this.logString, (data.debug ? " [Debug]" : ""), data.string, (typeof append === "undefined" ? "" : append));
		return true;
	},
	isFrame: function () {
		return window.frameElement || window.top !== window.self;
	}
};

showYTT.tagLog(showYTT.messages.loaded);

if(!showYTT.isFrame()) {
	window.addEventListener("readystatechange", function () { showYTT.addTags(); }, true);
	window.addEventListener("spfdone", function () { showYTT.addTags(); });
}
else {
	showYTT.tagLog(this.messages.iFrameOut);
}
