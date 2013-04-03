/*
 * js1k processing script
 * @author zz85 / http://github.com/zz85
 */

// Options
RUN_MINIFY = true
RUN_CRUSH = true

SOURCE = 'source.js'
MINIFY_TARGET = 'minified.js'
CRUSH_TARGET = 'crushed.js'
CLOSURE_CMD = 'java -jar compiler/compiler.jar --externs externs.js --compilation_level ADVANCED_OPTIMIZATIONS --js %s --js_output_file %s'

// Requires
fs = require("fs")
spawn = require('child_process').spawn
crusher = require('./jscrush.js')
uglify = require("uglify-js")


if (RUN_MINIFY)
	runUglifyMinify()
	// runClosureMinify()
else if (RUN_CRUSH)
	runCrush()


function stringBytes(source) {
	return encodeURI(source).replace(/%../g,'i').length
}

function runUglifyMinify() {

	console.log('\nRunning minifier: uglify-js...')

	raw = "(function(){"+fs.readFileSync(SOURCE).toString()+"})()"

	ugly_options = {
		// mangle_options: {except: ["e"]},
		fromString: true,
		mangle: true,
		output: {
			semicolons: true,
			space_colon: false,
			ie_proof: false
		},
		compress: {
			unsafe: true,
			hoist_vars: true,
			join_vars: true
		}
		// warnings: true
	}
	ugly = uglify.minify(raw, ugly_options);

	minified = ugly.code;

	minified = minified.slice(12,-5)
	if (ugly_options.output.semicolons)
		minified = minified.substring(minified.indexOf(';') + 1) // remove vars
	else {
		minified = minified.split('\n');minified.shift(); minified = minified.join('\n')
	}

	// console.log(minified);
	fs.writeFileSync(MINIFY_TARGET, minified, 'utf-8')
	sourceSize = stringBytes(raw)
	minifySize = stringBytes(minified)
	diffSize = (minifySize - sourceSize)
	console.log('' + sourceSize + 'B to ' + minifySize + 'B (' + diffSize +'B, ' + (diffSize / sourceSize * 1e4 | 0 )/ 100  + '%)..' )
	console.log('Minified file compiled to ' + MINIFY_TARGET + '.')

	if (RUN_CRUSH) runCrush()
}

function runClosureMinify() {

	function format(str) {
		for (i=1;i<arguments.length;i++) {
			str = str.replace('%s', arguments[i])
		}
		return str
	}

	function postprocess(contents) {
		contents = contents
			.substring(contents.indexOf(';') + 1) // remove vars
			.replace(/\b0[.]/g, '.') // remove leading 0s

		// remove trailing semicolon
		contents = contents.substring(0, contents.length-1)

		// if you wish to debug postprocessed string
		// console.log('\n' + contents + '\n')
		return contents

	}

	cmd = format(CLOSURE_CMD, SOURCE, MINIFY_TARGET)

	console.log('\nRunning minifier: ' + cmd + '...')

	args = cmd.split(' ')
	closure = spawn(args[0], args.slice(1))

	closure.stdout.on('data', function (data) {
		console.log('' + data)
	});

	closure.stderr.on('data', function (data) {
		console.error('' + data)
	});

	closure.on('exit', function (code) {
		if (code) {
			console.error('Minify failed.')
		} else {
			source = fs.readFileSync(SOURCE, 'utf8')
			contents = fs.readFileSync(MINIFY_TARGET, 'utf8')
			contents = postprocess(contents)
			fs.writeFileSync(MINIFY_TARGET, contents, 'utf8')


			sourceSize = stringBytes(source)
			minifySize = stringBytes(contents)
			diffSize = (minifySize - sourceSize)
			console.log('' + sourceSize + 'B to ' + minifySize + 'B (' + diffSize +'B, ' + (diffSize / sourceSize * 1e4 | 0 )/ 100  + '%)..' )
			console.log('Minified file compiled to ' + MINIFY_TARGET + '.')

			if (RUN_CRUSH) runCrush()
		}
	});
}


function runCrush() {
	console.log('\nRunning crusher on ' +  MINIFY_TARGET + '...')

	contents = fs.readFileSync(MINIFY_TARGET, 'utf8')

	crushed = crusher.crush(contents)
	fs.writeFileSync(CRUSH_TARGET, crushed, 'utf8')
	console.log('Crushed file written to ' + CRUSH_TARGET + '.')

}
