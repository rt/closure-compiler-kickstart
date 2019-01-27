goog.require("example");
goog.require("example.ClassB");


window["example"] = example;
window["example"]["ClassB"] = example.ClassB;
example.ClassB.prototype["getId"] = example.ClassB.prototype.getId;

