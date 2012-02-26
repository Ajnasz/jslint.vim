/*jslint laxbreak: true */
/*jshint laxbreak: true */

// By default we lodad the jslint, but if there is any argument defined we will
// load the jshint.
var JSLINT;
var fs, vm, sandbox, jslintCore = 'jslint-core.js', res;

var isJSHINT = false;
if (typeof require !== 'undefined') {
    isJSHINT = !!process.argv[2];
} else {
    isJSHINT = arguments.length > 0;
}

if (isJSHINT) {
    jslintCore = 'jshint-core.js';
}


if (typeof require !== 'undefined') {
    /*jslint node: true */
    print = require('util').puts;
    fs = require('fs');
    vm = require('vm');
    sandbox = {};
    res = vm.runInNewContext(fs.readFileSync(jslintCore), sandbox, jslintCore);
    JSLINT = isJSHINT ? sandbox.JSHINT : sandbox.JSLINT;
} else {
    load(jslintCore + '.js');
    if (isJSHINT) {
        /*global JSHINT: true*/
        JSLINT = JSHINT;
    } else {
        /*global JSLINT: true*/
        JSLINT = JSLINT;
    }
}

// Import extra libraries if running in Rhino.
if (typeof importPackage !== 'undefined') {
    importPackage(java.io);
    importPackage(java.lang);
}

var readSTDIN = (function () {
    // readSTDIN() definition for nodejs
    /*global process: true*/
    if (typeof process !== 'undefined' && process.openStdin) {
        return function readSTDIN(callback) {
            var stdin = process.openStdin()
              , body = [];

            stdin.on('data', function (chunk) {
                body.push(chunk);
            });

            stdin.on('end', function (chunk) {
                callback(body.join('\n'));
            });
        };

    // readSTDIN() definition for Rhino
    } else if (typeof BufferedReader !== 'undefined') {
        return function readSTDIN(callback) {
            // setup the input buffer and output buffer
            /*global System: true, InputStreamReader: true, BufferedReader: true*/
            var stdin = new BufferedReader(new InputStreamReader(System['in'])),
                lines = [];

            // read stdin buffer until EOF (or skip)
            while (stdin.ready()) {
                lines.push(stdin.readLine());
            }

            callback(lines.join('\n'));
        };

    // readSTDIN() definition for Spidermonkey
    } else if (typeof readline !== 'undefined') {
        return function readSTDIN(callback) {
            var line
              , input = []
              , emptyCount = 0
              , i;

            /*global readline: true */
            line = readline();
            while (emptyCount < 25) {
                input.push(line);
                if (line) {
                    emptyCount = 0;
                } else {
                    emptyCount += 1;
                }
                line = readline();
            }

            input.splice(-emptyCount);
            callback(input.join('\n'));
        };
    }
}());

readSTDIN(function (body) {
    var ok = JSLINT(body)
      , i
      , error
      , errorType
      , nextError
      , errorCount
      , WARN = 'WARNING'
      , ERROR = 'ERROR';

    if (!ok) {
        errorCount = JSLINT.errors.length;
        for (i = 0; i < errorCount; i += 1) {
            error = JSLINT.errors[i];
            errorType = WARN;
            nextError = i < errorCount ? JSLINT.errors[i + 1] : null;
            if (error && error.reason && error.reason.match(/^Stopping/) === null) {
                // If jslint stops next, this was an actual error
                if (nextError && nextError.reason && nextError.reason.match(/^Stopping/) !== null) {
                    errorType = ERROR;
                }
                print([error.line, error.character, errorType, error.reason].join(":"));
            }
        }
    }
});

