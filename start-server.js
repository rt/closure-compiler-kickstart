var server = require("./server");
var sourceMapCatch = require("./sourceMapCatch");
var scriptPaths = require("./scriptPathManager");
var fs = require("fs");
var p = require("path");
var projectsDir = "/projects/";
var projectsRelPath = "projects";
var outDir = p.join(__dirname , "/root-generated/");
var templatesDir = "root";



//run
main();


function main() {

	clearDir(outDir);

	buildTemplates(templatesDir);

	//copy overrideGoogProvideRequire script
	fs.createReadStream('overrideGoogProvideRequire.js').pipe(fs.createWriteStream(p.join(outDir, "overrideGoogProvideRequire.js")));
	
	mapHandlers();

}


//map handles
function mapHandlers() {

	var handle = [];
	var mapHandlersPath = p.join("handlers", "mapHandlers.json");
	if (p.existsSync(mapHandlersPath)) {
		var mapHandlersStr = fs.readFileSync(mapHandlersPath);
		var mapHandlers = JSON.parse(mapHandlersStr.toString());
		for (var i = 0; i < mapHandlers.length; i++) {
			var mapHandler = mapHandlers[i];
			mapHandler.argv = process.argv;
			var handler = require(mapHandler.handler);
			handle.push({path: mapHandler.path, handler: handler.getHandler(mapHandler)});

		}
	}

	//fixed handlers
	handle.push({path:"/projects", handler: sourceMapCatch.getHandler({mapPath: projectsRelPath})});
	handle.push({path:"/", handler: sourceMapCatch.getHandler({mapPath: outDir})});

	//start server
	var port = "8888";
	for (var i = 0; i < process.argv.length; i++) {
		var arg = process.argv[i];
		if (arg.indexOf("port:") == 0) {
			port = arg.replace("port:", "");
			break;
		}
	}
	server.start(handle, port);
	console.log("Server has started: http://127.0.0.1:" + port);
}

function buildTemplates(path) {

	//make same directory at output path
	var outDirPath = path.replace(templatesDir, outDir);
	if (!p.existsSync(outDirPath)) {
		fs.mkdirSync(p.normalize(outDirPath));
	}
	var linksPath = p.join(__dirname , "links.json");
	var links = {};
	if (p.existsSync(linksPath)) {
		var linksStr = fs.readFileSync(linksPath);
		links = JSON.parse(linksStr.toString());
	}

	//build all templates
	var templates = fs.readdirSync(path);
	for (var i = 0; i < templates.length; i++) {
		var template = templates[i];
		var stat = fs.statSync(p.join(path, template));
		if (stat.isDirectory()){
			buildTemplates(p.join(path, template));
		} else if (template.indexOf(".gitignore") != 0) {
		
			console.log("creating: " + outDirPath + " > " + template);
			//get template (template specifies what it wants)
			if (template !== "." && template !== "") {
				var file = fs.readFileSync(p.join(path, template), "utf8");

				var elements = file.split(/(<%|%>)/);
				var s = "";
				for (var j = 0; j < elements.length; j++) {
					var part = elements[j];
					if (part == "<%" && elements[j + 2] == "%>") {
						var inner = elements[j + 1];
						//replace
						var specs = inner.split(".");
						var cat = specs[0];
						switch (cat) {
							case "lib":
							var lib = specs[1];
							var libType = specs[2];
							switch (libType) {
								case "compiled":
									s += getScriptTag(projectsDir + lib + "/lib/compiled.js");
									break;

								case "compiled-emb":
									s += getEmbeddedScriptTag(p.join(projectsRelPath, lib, "lib", "compiled.js"));
									break;

								case "dev":
									s += getTags(lib);
									break;

								case "concat":
									s+= getConcatModule(lib);
									break;

								default:
									//ignore
									break;
							}
							break;

							case "links":
							var tag = specs[1];
							s += getScriptTag(links[tag]); 
							break;

							default:
							break;
						}
						//advance
						j += 2;
					} else {
						//add as is
						s += part;
					}
				}
				fs.writeFileSync(p.join(outDirPath, template), s, "utf8");
			}
		} 
	}
}

function getConcatModule(module) {
	var filePaths = scriptPaths.getFullPaths(module);
	var s = "";
	for (var i = 0; i < filePaths.length; i++) {
		var path = filePaths[i];
		var file = fs.readFileSync(path, "utf8");
		file = file.substring(file.indexOf("//-----"));	
		s += file;
	}
	return s;
}
/**
 * return script tags
 */
function getTags(module) {
	var s = "";
	s += getScriptTag("/overrideGoogProvideRequire.js");
	var paths =	scriptPaths.getLibPaths(module);
	for (var i = 0; i < paths.length; i++) {
		var path = paths[i];
		s += getScriptTag(path);
	}
	return s;
}

/**
 * get embedded script
 */
function getEmbeddedScriptTag(path, dontIncludeTag) {
	var file = fs.readFileSync(path);
	if (dontIncludeTag) {
		return file;
	} else {
		return "<script>" + file + "</script>";
	}
}

function getScriptTag(path) {
	return "<script src='" + path + "'></script>";
}
function clearDir(dir) {
	//clear out files
	if (p.existsSync(dir)) {
		var outfiles = fs.readdirSync(dir);
		for (var i = outfiles.length - 1; i >= 0; i--) {
			fs.unlink(dir + outfiles[i]);
		}
	} else {
		fs.mkdirSync(dir);
	}
}



