
goog.provide("example.ClassB");

goog.require("example.ClassA");

//-----file start

/**
 * @param {string} id
 * @constructor
 * @extends {example.ClassA}
 */
example.ClassB = function(id) {

	example.ClassA.call(this, id);

}
example.inherits(example.ClassB, example.ClassA);

/**
 * @return {string}
 * @override
 */
example.ClassB.prototype.getId = function() {
	return example.ClassB.superClass_.getId.call(this) + " from ClassB";
}


