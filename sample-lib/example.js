
goog.provide("example");

//-----file start
/**
 * base namespace, way to inherit
 */
var example = example || {};


/**
 * Taken from Google Closure
 * Inherit the prototype methods from one constructor into another.
 * Must call this right after child function definition
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
example.inherits = function(childCtor, parentCtor) {
	/** @constructor */
	function tempCtor() {};
	tempCtor.prototype = parentCtor.prototype;
	childCtor.superClass_ = parentCtor.prototype;
	childCtor.prototype = new tempCtor();
	/** @override */
	childCtor.prototype.constructor = childCtor;
};


/**
 * Taken from Google Closure
 * Used only for an easy way to call the base from controls (within core the control.superClass_.someMethod.call(this...) can be used
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 */
example.base = function(me, opt_methodName, var_args) {
	var caller = arguments.callee.caller;
	if (caller.superClass_) {
		// This is a constructor. Call the superclass constructor.
		return caller.superClass_.constructor.apply(
				me, Array.prototype.slice.call(arguments, 1));
	}

	var args = Array.prototype.slice.call(arguments, 2);
	var foundCaller = false;
	for (var ctor = me.constructor;
	ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
		if (ctor.prototype[opt_methodName] === caller) {
			foundCaller = true;
		} else if (foundCaller) {
			return ctor.prototype[opt_methodName].apply(me, args);
		}
	}

	// If we did not find the caller in the prototype chain,
	// then one of two things happened:
	// 1) The caller is an instance method.
	// 2) This method was not called by the right caller.
	if (me[opt_methodName] === caller) {
		return me.constructor.prototype[opt_methodName].apply(me, args);
	} else {
		throw Error(
				'example.base called from a method of one name ' +
		'to a method of a different name');
	}
};
