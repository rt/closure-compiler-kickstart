
/**
 * This file is to override the goog.provide/require method calls that exist for compilation dependency resolution.
 * When using source files wo/compilation (because compilation takes time) include this file to avoid the error for not having these methods.
 * Note: must not being using the Google Closure Library
 */


	var goog = goog || {};
	
	/**
	 * Creates namespace
	 * @param {string} path ie. "aa.bb.cc"
	 */
	goog.provide = function (path) {
		var parts = path.split(".");
		var lastRef = window;
		for (var i = 0; i < parts.length; i++) {
			var part = parts[i];
			lastRef[part] = lastRef[part] || {};
			lastRef = lastRef[part];
		}
	};
	goog.require = function (path) {
//		var parts = path.split(".");
//		var lastRef = window;
//		for (var i = 0; i < parts.length; i++) {
//			var part = parts[i];
//			if (lastRef[part] == "undefined") {
//				window.alert("requires: " + path + " at (" + part + ")");
//			}
//			lastRef = lastRef[part];
//		}
	};
	
	
