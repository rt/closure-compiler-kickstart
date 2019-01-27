var scriptPaths = require("./scriptPathManager");
var fs = require("fs");
var exec = require("child_process").exec;
var p = require("path");

if (process.argv.length < 4) {
	console.log("Usage: node compile lib basic|advanced");
} else {

	var module = process.argv[2];
	var mode = process.argv[3] || "advanced";
	var projectDir = 	p.join("projects", module);
	var compileLibDir = p.join(projectDir , "lib");
	if (!p.existsSync(compileLibDir)) {
		fs.mkdirSync(compileLibDir);
	}
	var outputPath = p.join(compileLibDir, "compiled.js");
	var outputMapPath = p.join(compileLibDir, "compiled.js.map");
	var execStr = "java -jar compiler.jar --js_output_file " + outputPath;
	
	//source maps
	execStr += " --create_source_map " + p.join(compileLibDir, "compiled.js.map");
	execStr += " --source_map_format=V3";
	execStr += " --warning_level VERBOSE";
	execStr += " --externs " + p.join(projectDir, "externs.js");

	//source files
	var filePaths = scriptPaths.getFullPaths(module);
	for (var i = 0; i < filePaths.length; i++) {
		var file = filePaths[i];
		execStr += " --js " + file;
	}

	//advanced mode
	if (mode == "advanced") {

		execStr += " --compilation_level ADVANCED_OPTIMIZATIONS";
		execStr += " --manage_closure_dependencies true"; 
		execStr += " --output_manifest " + p.join(compileLibDir, "compiled.manifest.MF");
		execStr += " --js " + p.join(projectDir, "export.js");
	}

	//compile
	var childProc = exec(execStr, function (error, stdout, stderr) {

		if (stdout) console.log('stdout: ' + stdout);
		if (stderr) console.log('stderr: ' + stderr);

		//adjust maps to point to libs handler
		var compiledMap = fs.readFileSync(outputMapPath, "utf8");
		compiledMap = replaceWithLibPath(compiledMap, module);

		//do imports as well
		var config = scriptPaths.getConfig(module);
		if (config != null && config.imports != null) {
			for (var i = 0; i < config.imports.length; i++) {
				var importModule = config.imports[i];
				compiledMap = replaceWithLibPath(compiledMap, importModule);
			}
		}
		fs.writeFileSync(outputMapPath, compiledMap, "utf8");

		//add source maps
		var compiled =	fs.readFileSync(outputPath, "utf8");
		compiled += "//@ sourceMappingURL=/projects/" + module + "/lib/compiled.js.map";
		fs.writeFileSync(outputPath, compiled, "utf8");
	});

}
function replaceWithLibPath(compiledMap, module) {

	var srcPath = scriptPaths.getSrcFullPath(module);
	var isWin = !!process.platform.match(/^win/);
	var epath = isWin ? srcPath.replace(/\\/g, "\\\\\\\\") : srcPath.replace(/\//g, "\\\/");
	var patt = eval("\/" + epath + "\/g");
	compiledMap = compiledMap.replace(patt, "/libs/" + module + "/"); 
	return compiledMap;
}


