// ==UserScript==
// @name        Show Youtube Tags
// @namespace   https://www.youtube.com/
// @description Adds tags for the current video to the video description, as the website previously offered. Currently, tags are buried in the page code.
// @include     *://www.youtube.com/*
// @version     1.3
// ==/UserScript==

// @include     *://www.youtube.com/watch?*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js

// Local Version: http://pastebin.com/XqtViMYW
console.log("Show YouTube Tags: Loaded.");
var information = {
	debug: false,
	unrelated: false,
	echoTypes: ["", "Error - ", "Warning - "]
};

function appendTags() {
	if(information.unrelated && window.location.href.indexOf("&list=") > -1) doUnrelated();
	var checkReturn = errorCheckTags();
	//if(errorCheckTags() > 0) return;
	if(typeof checkReturn === 'number') return;
	//var listObj = document.getElementsByClassName('watch-extras-section')[0];
	//var tags = ytplayer.config.args.keywords.replace(/,/g, ', ') || "-";
	//var li = listObj.children[listObj.children.length - 1].cloneNode(true);
	var tags = checkReturn.keywords.replace(/,/g, ", ") || "-",
		li = checkReturn.meta.cloneNode(true);
	li.id = "showYouTubeTags";
	li.getElementsByTagName('h4')[0].innerHTML = " Tags ";
	li.getElementsByTagName('li')[0].innerHTML = tags;
	checkReturn.container.appendChild(li);
	tagLog("Tags added.");
}
/*
function doUnrelated() {
	var a = document.getElementById("playlist-autoscroll-list");
	//var a = document.querySelector(".watch-non-stage-mode #watch-appbar-playlist.watch-playlist .playlist-videos-list");
	var b = a.querySelector("#watch-appbar-playlist:not(.watch-queue-nav) .playlist-videos-list > li.currently-playing");
	//a.scrollTo(b.scrollHeight * 5, 0);
	//yt-uix-scroller-scroll-unit
	a.scrollTop = b.offsetHeight * window.yt.config_.PLAYLIST_INDEX;
}
*/
function errorCheckTags() {
	var errorState = 0,
		output = {};
	//var listObj, listCont, tempObject;
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
				//if(window.ytplayer === undefined) {
				//	tagLog({string: "ytplayer property could not be found to retrieve video tags.", type: 1, debug: false, method: 2});
				//	errorState++;
				//}
				//else {
				//	var propList = ["config", "args", "keywords"];
				//	output.keywords = window.ytplayer;
				//	for(var i = 0; i < propList.length; i++) {
				//		if(output.keywords[propList[i]] === undefined) {
				//			tagLog({string: "Could not locate object property: " + propList[i], type: 1, debug: false});
				//			errorState++;
				//			break;
				//		}
				//		output.keywords = output.keywords[propList[i]];
				//	}
				//}

				output.container = document.getElementsByClassName('watch-extras-section')[0];
				if(output.container == null) {
					tagLog({string: "Could not locate proper description area.", type: 1, debug: false});
					errorState++;
				}
				else {
					//output.meta = output.container.children[output.container.children.length - 1];
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
	//document.addEventListener('readystatechange', appendTags, true);
	//window.addEventListener('DOMContentLoaded', appendTags, true);
	window.addEventListener('spfdone', appendTags);
}
else {
	tagLog({string: "Only applying listeners to top-level.", type: 2, debug: true});
}
/*
var toggled = false;
function testScript() {
    if (location.pathname !== "/watch" || location.search.search(/(&|\?)list=/) == -1) return;
    var PLArea = document.getElementById("watch-appbar-playlist");
    var PLAutoPlayB = PLArea.getElementsByClassName("toggle-autoplay")[0];
    var PLContent = PLArea.getElementsByClassName("playlist-header-content")[0];
	var state = (toggled ? "true" : "false");
    PLContent.setAttribute("data-initial-autoplay-state", state);
    //PLContent.setAttribute("initial-autoplay-state", state);
	if(!toggled && PLAutoPlayB.classList.contains("yt-uix-button-toggled"))
		PLAutoPlayB.classList.remove("yt-uix-button-toggled");
	else
		PLAutoPlayB.classList.add("yt-uix-button-toggled");
    //PLAutoPlayB.setAttribute("data-button-toggle", state);
    //window.yt.config_.LIST_AUTO_PLAY_VALUE = 0;
    //window.ytplayer.config.args.autoplay = "0";
	//addIt();
}
*/
//waitForKeyElements("#masthead-expanded-menu-list", appendTags, false);
//document.addEventListener('DOMContentLoaded', appendTags, false);

//waitForKeyElements("#watch7-container", appendTags, false);



/* Credit to Download YouTube Videos as MP4 (http://userscripts.org/scripts/show/25105) for the dynamicly updating Javascript. */
/*function initiateTag() {
    var pagecontainer = document.getElementById('page-container');
    if (!pagecontainer) {
		console.log("Show YouTube Tags: Error - Page Container not found.");
		return;
	}
    if (/^https?:\/\/www\.youtube.com\/watch\?/.test(window.location.href)) appendTags();
    var isAjax = /class[\w\s"'-=]+spf\-link/.test(pagecontainer.innerHTML);
    var content = document.getElementById('content');
    if (isAjax && content) { // Ajax UI
        var mo = window.MutationObserver || window.WebKitMutationObserver;
        if (typeof mo !== 'undefined') {
            var observer = new mo(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.addedNodes !== null) {
                        for (var i = 0; i < mutation.addedNodes.length; i++) {
                            if (mutation.addedNodes[i].id == 'watch7-container') { // old value: movie_player
								console.log("Show YouTube Tags: Entering from MutationObserver.");
                                appendTags();
                                break;
                            }
                        }
                    }
                });
            });
            observer.observe(content, {
                childList: true,
                subtree: true
            }); // old value: pagecontainer
        } else { // MutationObserver fallback for old browsers
			console.log("Show YouTube Tags: Error - No Mutation found. Using old method.");
            pagecontainer.addEventListener('DOMNodeInserted', onNodeInserted, false);
        }
    }
	else {
		console.log("Show YouTube Tags: Error - Ajax or Content check failed.");
	}
}

function onNodeInserted(e) {
    if (e && e.target && e.target.id == 'watch7-container') { // old value: movie_player
        appendTags();
    }
}

initiateTag();*/
/* End of Download YouTube Videos as MP4 code. */
/*
function appendTags() {
	//console.log("Show YouTube Tags: Attempting tag addition.");
	if(typeof ytplayer === 'undefined' || window['ytplayer'] === undefined) {
		if(window.top == window.self)
			alert("Show YouTube Tags: Error - ytplayer property could not be found to retrieve video tags. Please check if YouTube has updated and broken tag handling.");
		return;
	}
	if(document.getElementById('showYouTubeTags')) {
		console.log("Show YouTube Tags: Error - Avoiding adding taglist twice.");
		return;
	}

	//var extras = document.getElementById('watch-description-extras').children[0];
	var extras = document.getElementsByClassName('watch-extras-section')[0];
	if(extras !== 'undefined') {
		//var tags = ytplayer.config.args.keywords.replace(/,/g, ', ') || "-";
		var tags = typeof ytplayer.config.args.keywords !== "undefined" ? ytplayer.config.args.keywords.replace(/,/g, ', ') || "-" : "<strong>Unable to locate tags</strong>";
		//if (!tags) {
		//	tags = "-";
		//}
		//console.log("Show YouTube Tags: Tags: " + tags);
		//var liOrg = extras.children[extras.children.length - 1].cloneNode(true);
		//var liOrg = extras.children[extras.children.length - 1];
		//if(liOrg.getElementsByTagName('h4')[0].innerHTML == " Tags ") {
		//	console.log("Show YouTube Tags: Error - Avoiding adding taglist twice.");
		//	return;
		//}
		//console.log("Show YouTube Tags: Element Classname: " + liOrg.className);
		//var li = liOrg.cloneNode(true);
		var li = extras.children[extras.children.length - 1].cloneNode(true);
		li.id = "showYouTubeTags";
		//console.log("Show YouTube Tags: Element Classname: " + li.className);
		//li.children[0].innerHTML = "Tags";
		li.getElementsByTagName('h4')[0].innerHTML = " Tags ";
		//li.getElementsByTagName('p')[0].innerHTML = tags; //Switched to nested list 8/21/2014 
		li.getElementsByTagName('li')[0].innerHTML = tags;
		extras.appendChild(li);
		console.log("Show YouTube Tags: Tags added.");
		//console.log("Show YouTube Tags: Added " + tags + " to " + extras);
	}
	else {
		console.log("Show YouTube Tags: Error - Could not locate proper description area.");
	}

//	var li = document.createElement('li')
//	li.innerHTML = 
//		'<h4 class="title">Tags</h4> \
//		<div class="content"> \
//			<p id="eow-reuse"> ' + tags + ' </p> \
//		</div>'
//	document.getElementById('watch-description-extras').children[0].appendChild(li);
	//document.removeEventListener('DOMContentLoaded', appendTags, false);
}
*/
