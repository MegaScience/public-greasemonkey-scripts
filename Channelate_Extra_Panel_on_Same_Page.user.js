// ==UserScript==
// @name        Channelate Extra Panel on Same Page
// @namespace   channelate.com
// @description Adds the Extra Panel for each comic back to the comic page.
// @include     /^https?://(www\.)?channelate\.com/(\d{4}/\d{2}/\d{2}/[\w-]+/)?$/
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @version     1.2
// @grant       GM_addStyle
// ==/UserScript==

var exPanel = document.getElementById("extrapanelbutton");

if (!!exPanel) {
	var comicArea = document.getElementById("comic"),
		clonedComic = comicArea.getElementsByClassName("comicpane")[0].cloneNode(true);
	clonedComic.id = "extra" + clonedComic.id;
	clonedComic.getElementsByTagName("img")[0].remove();
	GM_addStyle(".extrapanelimage { opacity: 0.1 } .extrapanelimage:hover { opacity: 1 }");
	comicArea.appendChild(clonedComic);
	$('#extracomic-1').load(exPanel.getElementsByTagName("a")[0].href + ' .extrapanelimage');
}
else {
	console.log("This page (seemingly) does not have a comic/extra panel.");
}
