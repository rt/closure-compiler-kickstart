var fs = require("fs");
var url = require("url");
var p = require("path");
var scriptPaths = require("./scriptPathManager");

function MyHandler(config) {
	this.config = config || {};
}

MyHandler.prototype.handle = function(response, request, relPath) {

	var path;
	var sourceMapPath = "/" + relPath;
	if (relPath.indexOf("libs/") == 0) {
		var elements = relPath.split("/");
		elements.shift();//shift out "libs"
		var lib = elements.shift();
		var rem = elements.join("/");
		var srcPath = scriptPaths.getSrcFullPath(lib);
		path = p.join(srcPath, rem);
	} else {

		if (relPath.indexOf("/") == 0) {
			relPath = relPath.substring(1);//remove "/"
		} else if (relPath == ""){
			//welcome file?
			relPath = this.config.defaultFile;
		} else {
			//leave alone
		}

		//anything else is served as file
		path = p.join(this.config.mapPath, relPath);
	}

	fs.readFile(path, "utf8", function(error, file) {
		if(error) {

			console.log("Not found: " + path);
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not found");
			response.end();
		} else {
			var ext = path.substring(path.lastIndexOf(".") + 1);
			switch (ext) {
				case "js":
					response.writeHead(200, {"Content-Type": "application/javascript"});
					response.write(file);
					break;

				case "html":
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write(file);
					break;

				case "css":
					response.writeHead(200, {"Content-Type": "text/css"});
					response.write(file);
					break;

				case "jpg":
					response.writeHead(200, {"Content-Type": "image/jpeg"});
					response.write(file, "binary");
					break;


				default:
					response.writeHead(200, {"Content-Type": "text/plain"});
					response.write(file);
					break;
			}
			response.end();
		}
	});

}

exports.getHandler = function(config) {
	return new MyHandler(config);
}
