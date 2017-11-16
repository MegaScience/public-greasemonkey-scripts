// ==UserScript==
// @name        Show Youtube Video Tags
// @namespace   https://www.youtube.com/
// @description Adds tags for the current video to the video description, as the website previously offered. Currently, tags are buried in the page code.
// @match       *://*.youtube.com/*
// @exclude     /^https?:\/\/(www.)?youtube\.com\/embed\/.*$/
// @noframes
// @version     4.0
// @grant       none
// ==/UserScript==

const primary = function () {
	const showYTT = {
		debug: false,
		echoType: ['log', 'error', 'warn'],
		logString: 'Show YouTube Tags%s: %s%s',
		logMess: {
			loaded: {type: 0, debug: false, string: 'Loaded.'},
			problem: {type: 2, debug: true, string: 'Tag addition will cancel due to error(s).'},
			added: {type: 0, debug: false, string: 'Tags added.'},
			wrongPage: {type: 2, debug: true, string: 'Non-video Page: '},
			iFrame: {type: 2, debug: false, string: 'Script running in incorrect scope.'},
			exists: {type: 2, debug: false, string: 'Tags already added. Avoiding adding taglist twice.'},
			//objMiss: {type: 1, debug: true, string: 'Object unable to be located.'},
			descMiss: {type: 1, debug: false, string: 'Could not locate required description area.'},
			descChan: {type: 1, debug: false, string: 'Description area format changed.'},
			returning: {type: 0, debug: true, string: 'Sending required data.'},
			objProp: {type: 1, debug: false, string: 'Could not locate object property: '},
			iFrameOut: {type: 2, debug: true, string: 'Only applying listeners to top-level scope.'},
			unknownIssue: {type: 2, debug: true, string: 'Unaccounted issue: '}
		},
		addTags: function () {
			let data = this.errorCheck();
			if(data.errState) return;
			let tags = data.keywords.replace(/,/g, ', ') || '-',
				li = data.meta.cloneNode(true);
			li.id = 'showYouTubeTags';
			li.getElementsByTagName('h4')[0].innerHTML = ' Tags ';
			li.getElementsByTagName('li')[0].innerHTML = tags;
			data.container.appendChild(li);
			this.tagLog(this.logMess.added, ' (' + data.video_id + ')');

			if(!this.debug) return;
			this.tagLog({type: 0, debug: false, string: 'Testing...'});
			this.tagLog(this.logMess.problem);
			this.tagLog(this.logMess.descMiss);
			this.tagLog(this.logMess.returning);
			this.confirmObject(['ytplayer', 'config', 'fart', 'keywords']);
		},
		errorCheck: function () {
			let data = { errState: false };
			try {
				if(location.pathname !== '/watch')
					throw [this.logMess.wrongPage, location.pathname];
				if(this.isFrame())
					throw this.logMess.iFrame;
				if(document.getElementById('showYouTubeTags'))
					throw this.logMess.exists;
				data.keywords = this.confirmObject(['ytplayer', 'config', 'args', 'keywords']);
				if(data.keywords === 'ShowYTTErr')
					throw false;
				data.container = document.getElementsByClassName('watch-extras-section');
				if(data.container.length === 0)
					throw this.logMess.descMiss;
				else
					data.container = data.container[0];
				data.meta = data.container.lastElementChild;
				// Add check if lastElementChild was blank.
				if(data.meta.getElementsByTagName('h4').length === 0 || data.meta.getElementsByTagName('li').length === 0)
					throw this.logMess.descChan;
				data.video_id = this.confirmObject(['ytplayer', 'config', 'args', 'video_id']);
				if(typeof data.video_id === 'boolean')
					data.video_id = 'ID Not Found';
			}
			catch(e) {
				data.errState = true;
				if(typeof e.message !== 'undefined')
					this.tagLog(this.logMess.unknownIssue, e.message);
				else if(Array.isArray(e))
					this.tagLog(e[0], e[1]);
				else if(e !== false)
					this.tagLog(e);
				this.tagLog(this.logMess.problem);
			}
			finally {
				this.tagLog(this.logMess.returning);
				return data;
			}
		},
		confirmObject: function (arr) {
			return arr.reduce((last, current, index) => {
				if(typeof last[current] === 'undefined') {
					this.tagLog(this.logMess.objProp, arr.slice(0, (index + 1)).join('.'));
					return 'ShowYTTErr';
				}
				return ( last === 'ShowYTTErr' ? last : last[current] );
			}, window);
		},
		tagLog: function (message, append) {
			let data = (typeof message === 'string' ? this.logMess[message] : message);
			if(data.debug && !this.debug) return false;
			console[this.echoType[data.type]](this.logString, (data.debug ? ' [Debug]' : ''), data.string, (typeof append === 'undefined' ? '' : append));
			return true;
		},
		isFrame: function () {
			return window.frameElement || window.top !== window.self;
		}
	};
	Object.defineProperty(window, 'showYTT', {
		value: showYTT,
		writable: false,
		enumerable: true,
		configurable: true
	});

	showYTT.tagLog(showYTT.logMess.loaded);

	if(!showYTT.isFrame()) {
		window.addEventListener('readystatechange', () => showYTT.addTags(), true);
		window.addEventListener('spfdone', () => showYTT.addTags());
	}
	else {
		showYTT.tagLog(showYTT.logMess.iFrameOut);
	}
};

const script = document.createElement('script');
script.appendChild(document.createTextNode('('+ primary +')();'));
(document.body || document.head || document.documentElement).appendChild(script);
