// ==UserScript==
// @name       2048 auto play
// @version    0.5
// @match      *://gabrielecirulli.github.io/2048/
// @copyright  2014, Garzon - 2016, MegaScience
// ==/UserScript==

// Credit to Garzon for the majority of this code: http://userscripts-mirror.org/scripts/show/410768

function wrapper() {
	if (typeof window.autoPlay !== 'function') window.autoPlay = function() {};

	window.autoPlay.isAutoMode = false;

	window.requestAnimationFrame(function() {
		window.userManager = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
		window.userManager.actuator.explainContainer = document.querySelector(".game-explanation");

		function createButton(func, value, style) {
			var input = document.createElement("input");
			input.type = "button";
			input.onclick = func;
			input.value = value;
			input.setAttribute("style", style);

			window.userManager.actuator.explainContainer.appendChild(input);
		}
		createButton(function () {window.autoPlay.toggleAuto();}, "Auto Play/Pause", "float: right;");
		createButton(function () {window.autoPlay.step();}, "Step By Step", "float: left;");
	});

	window.autoPlay.toggleAuto = function() {
		window.autoPlay.isAutoMode = !window.autoPlay.isAutoMode;
		if (window.autoPlay.isAutoMode)
			window.autoPlay.solve();
	};

	window.autoPlay.emptyMap = function() {
		return [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		];
	};

	window.autoPlay.transpose = function(orimap, aimmap) {
		for (var j = 0, k; j <= 3; j++) {
			for (k = 0; k <= 3; k++) {
				aimmap[k][j] = orimap[j][k];
			}
		}
	};

	window.autoPlay.countTiles = function(rowmap) {
		var res = 0;
		for (var j = 0, k; j <= 3; j++) {
			for (k = 0; k <= 3; k++) {
				if (rowmap[j][k] !== 0) res++;
			}
		}
		return res;
	};

	window.autoPlay.isFixed = function(map1, map2) {
		for (var j = 0, k; j <= 3; j++) {
			for (k = 0; k <= 3; k++) {
				if (map1[j][k] !== map2[j][k])
					return false;
			}
		}
		return true;
	};

	window.autoPlay.debugOutput = function(extraInfo, rowmap) {
		var debugstr = extraInfo + ": \n";
		for (var j = 0, k; j <= 3; j++) {
			for (k = 0; k <= 3; k++) {
				debugstr = debugstr + rowmap[j][k] + " ";
			}
			debugstr += "\n";
		}
		console.log(debugstr);
	};

	window.autoPlay.getStatus = function() {
		var rowmap = window.autoPlay.emptyMap();
		for (var j = 0, k, cells = window.userManager.grid.cells; j <= 3; j++) {
			for (k = 0; k <= 3; k++) {
				rowmap[j][k] = (cells[k][j] !== null ? cells[k][j].value : 0);
			}
		}
		return rowmap;
	};

	window.autoPlay.nextStatus = function(op, rowmap) {
		var res = 1, b = 0, e = 3,
			nextrowmap = window.autoPlay.emptyMap(),
			nextcolmap = window.autoPlay.emptyMap(),
			colmap = window.autoPlay.emptyMap(),
			pnmap, apnmap, d, zz;
		window.autoPlay.transpose(rowmap, colmap);
		pnmap = nextrowmap;
		apnmap = nextcolmap;
		if (op === 0) {
			d = 1;
			rowmap = colmap;
			pnmap = nextcolmap;
			apnmap = nextrowmap;
		} // up
		if (op === 1) {
			d = -1;
			b = 3;
			e = 0;
		} // right
		if (op === 2) {
			d = -1;
			b = 3;
			e = 0;
			rowmap = colmap;
			pnmap = nextcolmap;
			apnmap = nextrowmap;
		} // down
		if (op === 3) {
			d = 1;
		} // left
		for (var j = 0, k, zz; j <= 3; j++) {
			k = b;
			while (d * k <= e) {
				if (rowmap[j][k] !== 0) {
					zz = k + d;
					while ((zz >= 0) && (zz < 4) && (rowmap[j][zz] === 0)) zz = zz + d; // find next tile
					if ((zz >= 0) && (zz < 4)) {
						if (rowmap[j][k] === rowmap[j][zz]) { // merge
							pnmap[j][zz] = rowmap[j][zz] * 2;
							k = zz; // jump , ignore the tile @ zz
						} else { // place
							pnmap[j][zz - d] = rowmap[j][k];
							k = zz - d; // deal with next tile @ zz
						}
					} else { // move
						zz -= d;
						pnmap[j][zz] = rowmap[j][k];
						break; // no more tiles
					}
				}
				k += d;
			}
		}
		// fall down
		for (var j = 0, k, zz; j <= 3; j++) {
			for (k = b; d * k <= e; k += d) {
				if (pnmap[j][k] !== 0) {
					zz = k - d;
					while ((zz >= 0) && (zz < 4) && (pnmap[j][zz] === 0)) zz = zz - d; // find the ground
					zz = zz + d; // pile up
					pnmap[j][zz] = pnmap[j][k]; // place
					if (k !== zz)
						pnmap[j][k] = 0; // clean if moved
				}
			}
		}
		// copy to another map
		window.autoPlay.transpose(pnmap, apnmap);
		return nextrowmap;
	};

	window.autoPlay.evalCost = function(rowmap) {
		var res = 0,
		res1 = window.autoPlay.countTiles(rowmap);

		if (res1 === 16) {
			var flag = false;
			for (var j = 0; j <= 3; j++) {
				if (!window.autoPlay.isFixed(rowmap, window.autoPlay.nextStatus(j, rowmap))) {
					flag = true;
					break;
				}
			}
			if (!flag)
				return 1e69;
		}

		res1 = Math.round(Math.pow(2, res1 + 8));
		var map = [
			[14, 15, 16, 17],
			[ 6,  7, 13, 16],
			[ 5,  6,  7, 15],
			[ 3,  5,  6, 14]
		];

		for (var j = 0, k; j <= 3; j++)
			for (k = 0; k <= 3; k++)
				if (rowmap[j][k] !== 0) {
					res -= Math.pow(2, map[j][k]) * rowmap[j][k];
				}
		return res + res1;
	};

	window.autoPlay.dfs = function(depth, rowmap) {
		if (depth === 0) return [-1, window.autoPlay.evalCost(rowmap)];
		var planDir = [
				[Math.floor(Math.random() * 4), 1e20]
			];
		for (var i = 0, res = 0, flag = false, tmpcount = 0, nextrowmap = window.autoPlay.nextStatus(i, rowmap), j, k, ret, minTiles = 6, count = window.autoPlay.countTiles(rowmap);
			i < 4;
			i++, res = 0, tmpcount = 0, flag = false, nextrowmap = window.autoPlay.nextStatus(i, rowmap)) {
			if (window.autoPlay.isFixed(rowmap, nextrowmap)) continue;
			for (j = 0; j < 4; j++) {
				for (k = 0; k < 4; k++)
					if (nextrowmap[j][k] === 0) {
						if (count > minTiles) nextrowmap[j][k] = 2;
						flag = true;
						tmpcount++;
						ret = window.autoPlay.dfs(depth - 1, nextrowmap);
						res += ret[1];
						//res=Math.max(res,ret[1]);
						nextrowmap[j][k] = 0;
						if (!(count > minTiles)) break;
						nextrowmap[j][k] = 4;
						res -= ret[1] * 0.1;
						ret = window.autoPlay.dfs(depth - 1, nextrowmap);
						res += ret[1] * 0.1;
						//res=Math.max(ret[1],res);
						nextrowmap[j][k] = 0;
					}
				if (flag)
					if (!(count > minTiles)) break;
			}
			if (!flag) {
				tmpcount++;
				ret = window.autoPlay.dfs(depth - 1, nextrowmap);
				res = ret[1];
			}
			if (tmpcount === 0) continue;
			res = res / tmpcount;
			var comp = planDir[0][1] - res;
			//if(window.autoPlay.isFixed(rowmap,window.autoPlay.nextStatus(i,rowmap))) comp=-1;  // or stuck
			if (comp > 0) {
				planDir = [
					[i, res]
				];
			} else {
				if (comp === 0) {
					planDir = planDir.concat([
						[i, res]
					]);
				}
			}
		}
		return planDir[0];
	};

	window.autoPlay.step = function() {
		var rowmap = window.autoPlay.getStatus(),
			ret = window.autoPlay.dfs(3, rowmap);
		window.userManager.move(ret[0]);
	};

	window.autoPlay.solve = function() {
		if(!window.autoPlay.isAutoMode) return;
		if(window.userManager.isGameTerminated()) {
			window.autoPlay.toggleAuto();
			return;
		}
		window.autoPlay.step();
		window.setTimeout("window.autoPlay.solve()", 100);
	};
};
// Wrapping this makes it way faster.
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')();'));
(document.body || document.head || document.documentElement).appendChild(script);
