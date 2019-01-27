/**
 * Gives lib paths from config/ files
 */
var fs = require("fs");
var p = require("path");

var configs = {};
load(__dirname + "/projects");


function load(path) {
	var files = fs.readdirSync(path);	

	for (var i = 0; i < files.length; i++) {
		var file = files[i];			
		var stat = fs.statSync(p.join(path, file));
		if (stat.isDirectory()) {
			var s = fs.readFileSync(p.join(path, file, "config.json"));
			var o = JSON.parse(s.toString());
			configs[file] = o;
			//configs[o.name] = o; //could do this if file name is not good
		}
	}
}
function getLibPaths(libName) {
	var o = configs[libName];
	var ret = [];
	if (o.imports) {
		for (var i = 0; i < o.imports.length; i++) {
			var importLib = configs[o.imports[i]];
			for (var j = 0; j < importLib.list.length; j++) {
				ret.push("/libs/" + o.imports[i] + "/" + importLib.list[j]);
			}
		}
	}
	for (var k = 0; k < o.list.length; k++) {
		ret.push("/libs/" + libName + "/" + o.list[k]);
	}
	return ret;
};

function getFullPaths(libName) {
	var o = configs[libName];
	var ret = [];
	if (o.imports) {
		for (var i = 0; i < o.imports.length; i++) {
			var importLib = configs[o.imports[i]];
			for (var j = 0; j < importLib.list.length; j++) {
				var path;
				if (importLib.srcPath.indexOf("/") != 0) {
					//relative path specified
					path = p.join(__dirname, importLib.srcPath);
				} else {
					path = importLib.srcPath;
				}
				ret.push(p.join(path, importLib.list[j]));
			}
		}
	}
	for (var k = 0; k < o.list.length; k++) {

		var path;
		if (o.srcPath.indexOf("/") != 0) {
			//relative path specified
			path = p.join(__dirname, o.srcPath);
		} else {
			path = o.srcPath;
		}
		ret.push(p.join(path, o.list[k]));
	}
	return ret;
}
function hasPath(incomingPath) {
	for (var key in configs) {
		var o = configs[key];
		var path;
		if (o.srcPath.indexOf("/") != 0) {
			//relative path specified
			path = p.join(__dirname, o.srcPath);
		} else {
			path = o.srcPath;
		}
		if (incomingPath.indexOf(path) == 0) {
			return true;
		}
	}
	return false;
}
function getConfig(libName) {
	return configs[libName];
}
function getSrcPath(libName) {
	var o = configs[libName];
	return o.srcPath;
}
function getSrcFullPath(libName) {
	var o = configs[libName];
	if (o.srcPath.indexOf("/") == 0 || o.srcPath.indexOf(":") != -1) {//full path specified
		return o.srcPath;
	} else {
		//make relative path full path
		return p.join(__dirname, o.srcPath);
	}
}
exports.getConfig = getConfig;
exports.getLibPaths = getLibPaths;
exports.getFullPaths = getFullPaths;
exports.hasPath = hasPath;
exports.getSrcPath = getSrcPath;
exports.getSrcFullPath = getSrcFullPath;
