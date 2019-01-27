var http = require("http");
var url = require("url");
var fs = require("fs");
var p = require("path");


function start(handlers, port) {

	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
		console.log("Request for " + pathname + " received.");
		route(handlers, pathname, response, request);
	}

	http.createServer(onRequest).listen(port);
}

function route(handles, pathname, response, request) {

	for (var i = 0; i < handles.length; i++) {
		var h = handles[i];
		if (pathname.indexOf(h.path) == 0) {
			//handle
			try {

				h.handler.handle(response, request, pathname.replace(h.path, ""));

			} catch (e) {

				console.log("Not found: " + pathname);
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.write("404 Not found");
				response.end();

			}
			break;
		}
	}
}

exports.start = start;
