goog.provide("example.ClassA");

goog.require("example.interfaces.Identifiable");

//-----file start

/**
 * @param {string} id
 * @constructor
 * @implements {example.interfaces.Identifiable}
 */
example.ClassA = function(id) {
	this.id = id;
}

/**
 * @return {string}
 * @override
 */
example.ClassA.prototype.getId = function() {
	return this.id;	
}


