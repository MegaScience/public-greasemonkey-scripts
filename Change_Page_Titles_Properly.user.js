// ==UserScript==
// @name        Change Page Titles Properly
// @namespace   nexon.net
// @description Changes the page title for tab clarity
// @include     /https?:\/\/[^\.]+\.nexon\.net\/community(\/(forums)?)?(#.*)?/
// @exclude     /https?:\/\/forum2\.nexon\.net\/.*?/
// @run-at      document-idle
// @version     1
// @grant       GM_xmlhttpRequest
// ==/UserScript==

function setTitle() {
	//var hash = window.location.hash,
	//	title = hash.match(/.*?-([^%]+)(%|$)/);
	var hash = window.location.hash.match(/%2F(.*?)-/),
		title = hash === null ? "" : "%2F" + hash[1];
	GM_xmlhttpRequest({
	  method: "GET",
	  url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fforum2.nexon.net" + title + "%22%20and%20xpath%3D'%2F%2Fhead%2Ftitle'&format=json",
	  onload: function(response) {
		var title = "",
			resObj = JSON.parse(response.responseText);
		if(resObj.query.results !== null && resObj.query.results.title !== "Nexon Forums")
			title = JSON.parse(response.responseText).query.results.title.replace(" - Nexon Forums", "") + " - ";
		document.title = title + siteName;
	  }
	});
	//title = (title == null) ? "" : title[1].replace(/-/g, " ") + " - "; 
	//document.title = title + siteName;
}

function getSiteName() {
	try {
		//alert(nexon.util.getGame());
		//console.log(nexon);
		//document.querySelector(".header-logo img[alt], .logo img[alt]").getAttribute("alt");
		var sn = " ";
		for(var i = 0, len = nexon.games.gameList.length, domain = window.location.host; i < len; i++) {
			if(nexon.games.gameList[i].domainRegex && nexon.games.gameList[i].domainRegex.test(domain)) {
				sn += nexon.games.gameList[i].name;
				break;
			}
		}
		return sn + " Forum";
	}
	catch(e) {
		//alert(e.message);
		return "Nexon Forums";
	}
}

var siteName = getSiteName();

setTitle();

window.addEventListener("hashchange", setTitle, false);

//document.querySelector(".component.component-breadcrumbs span").onclick = function () {console.log(window);};

//console.log(confirmObject(["nexon", "games", "gameList"]));
function confirmObject(array) {
	var tempObject = window;
	for(var i = 0, len = array.length; i < len; i++) {
		if(tempObject[array[i]] === undefined) {
			alert("Could not locate object property: " + array.slice(0, (i + 1)).join("."));
			return false;
		}
		tempObject = tempObject[array[i]];
	}
	return tempObject;
}

/*
function init() {
	var scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";
    scriptElement.id = "mainScript";
	scriptElement.appendChild(document.createTextNode('function setTitle(callback) {alert(callback.query.results.title);}'));
	(document.body || document.head || document.documentElement).appendChild(scriptElement);
	getTitle();
	window.addEventListener("hashchange", getTitle, false);
}
function getTitle() {
	var scriptElement = document.getElementById("getTitle");
	if(document.getElementById("getTitle")) scriptElement.remove();
    scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";
    scriptElement.id = "getTitle";
    scriptElement.src = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fforum2.nexon.net%2F" + window.location.hash.match(/%2F(.*?)-/)[1] + "%22%20and%20xpath%3D'%2F%2Fhead%2Ftitle'&format=json&callback=setTitle";
    //scriptElement.src = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fforum2.nexon.net%2Fshowthread.php%3F1539474%22%20and%20xpath%3D'%2F%2Fhead%2Ftitle'&format=json&callback=setTitle";
    (document.body || document.head || document.documentElement).appendChild(scriptElement);
}
init();
*/
//document.getElementById("forum-frame").onload = function () { setTitle(); };

/*
document.getElementById("forum-frame").onload = function () {
  document.title = window.location.hash.match(/.*?-(.*?)%/)[1];
};
*/
