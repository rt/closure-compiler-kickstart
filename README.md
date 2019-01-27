Closure-Compiler-Kickstart
==========================


> THIS IS VERY OLD, KEPT AS REFERENCE FROM AN POST I MADE A LONG TIME AGO. [http://www.techhui.com/profiles/blogs/staying-in-control-with-closure-compiler](http://www.techhui.com/profiles/blogs/staying-in-control-with-closure-compiler)

As well as optimizing and obfusicating you code, the Closure Compiler keeps large code bases more maintainable by enforcing/warning you about types, interfaces, signatures, etc.  This project provides a lightweight environment to help you compile and debug your javascript projects/files with use of the Closure Compiler, without any dependency on the Closure Library.  

Enjoy a save / reload development style.  When needed compile and even debug your compiled version via source maps.

### Getting Started
An example-project is included and probably is the best reference to get you kickstarted. 

1. Download node from http://nodejs.org 

2. Get this.
```bash
$ git clone git://github.com/rt/closure-compiler-kickstart.git
```

3. Compile the example-project
```bash
$ node compile example-project advanced
```

4. Start server 
```bash
$ node start-server
```

5. Open http://127.0.0.1:8888/example-project/compiled.html in preferably Chrome browser.  

6. Click on the links to navigate you between compiled.html, dev.html, and compiled-emb.html and view the source. 

7. Pull up developer tools and enable source maps to view and debug souce code against runtime compiled version (this only works with compiled and compile-emb).

### Setting up your project(s)
The easiest way to start is copy and rename the example-project.  The projects directory contains one sub-directory per project.  The sub-directory name becomes the library name.  A config.json file must exist as follows

`config.json`:
```javascript
{
	"srcPath": "path/to/your/source/code/",
	"imports": ["myOtherLibrary"],					//only use this line if requiring other libraries
	"list": 
		[
			"relative/to/srcPath1.js",
			"relative/to/srcPath2.js"
		]
}
```
The "srcPath" specifies the path to the top of your source files.  Use a relative path from the closure-compiler-kickstart directory.
If you look at the example-project/config.json you will see it points to the sample-lib/ directory.
The "list" order of your sources files is the order that the files are compiled and outputted.
The "imports" name allows you to bring in other projects.

`externs.js`: If you are using other libraries, such as JQuery, you might need to declare extern in the externs.js file.

`export.js`: If you are creating a library, you probably need to export functions so they don't get mashed up.  Look at the export.js file for the example-project so that it can be accessed externally.

See https://developers.google.com/closure/compiler/docs/api-tutorial3

### Source Files
Your source files will need to specify a header with import like statements, including what it provides.
```javascript
goog.provide("namespace.or.Class.this.file.provides")

goog.require("imported.Class")
```
Look at inside the sample-lib/ directory, this is where example-project/config.json points to.  By no means do you have to use this progamming style.

You will also use JsDoc comments to architect you application.  The compiler uses the annotations to understand your program.

See https://developers.google.com/closure/compiler/docs/js-for-compiler

### Compiling
Specify either "advanced" or "basic", usually you will want to compile in advanced mode.  Basic only concatenates and renames local variables.  
```bash
$ node compile.js mylibrary advanced|basic 
```

### Add pages to root
You may want to test your library in various pages.  Place a simple tag showing how you want your library to be pasted in your page.  Everytime the server is started these pages are created in the out directory, which is mapped to root.
`<%lib.mylibrary%>`  :	script tag pointed to your compiled library  

`<%lib.mylibrary.emb%>`	:	script tag with the compiled library embedded  

`<%lib.mylibrary.dev%>`	:	all the script tags pointing to your source code files
Look in the root/example-project/ and root-generated/example-project/ directories to see how the tags have been replaced.  The heirarchy you place in root/ will be preserverd in root-generated/.
The example-project/ will be a reserved directory.

If you have addition external scripts you would like to add to this process add a links.json file to the top directory and your sources as follows.

`<%links.mysrc%>`	:  embed script tag with the matching key

`links.json`:
```javascript
{
	mysrc: "http://...",
	jquery: "http://jquery..."
}
```

### Running the server
Start the server with the following command.  Specifying a port is optional.  If you are adding your own handlers you may specify arguments and they will be passed in.
```bash
$ node start-server port:8888
```

### Setting up handlers (optional)
Create an entry in handlers/mapHandlers.json and add your own handlers to mimic your production environment.

`mapHandlers.json`: is an array of config objects passed to your handlers.
```javascript
	[
		{"path": "/data1", "handler": "handlers/myHandler1"},
		{"path": "/data2", "handler": "handlers/myHandler2", "otherConfigInfo": "some info"}
	]
```
Your handler must follow the design below.
- the config object you specified in mapHandlers.json will be passed to your constructor along with an added "argv" array passed from the command line.
-	define member function and export it to `getHandler`.  That function is passed the response/request objects as well as the relative path from the path the handler was mapped to.

`myHandler.js`:
```javascript
	function MyHandler(config) {
		this.config = config;
	}

	MyHandler.prototype.handle = function(response, request, relPath) {

		...
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write();
		response.end();

	}

	exports.getHandler = function(config) {
		return new MyHandler(config);
	}
```

