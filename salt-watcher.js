var path = require('path'),
    fs = require('fs'),
    util = require('util'),
    exec = require('child_process').exec, child;

var mkdirp = require('mkdirp'),
    rimraf = require('rimraf'),
    concat = require('concat'),
    chokidar = require('chokidar'),
    requirejs = require('requirejs');
    sass = require('node-sass');    

var isDevEnv = process.argv.length === 3 && process.argv[2] === '--dev';

/**** Configuration Objects ****/
var config = {
    /** SASS **/
    sass: {
        inputConfig: {
            file: 'assets/scss/style.scss',
            outputStyle: 'compressed'
        },
        outputPath: path.join('assets','css','style.css')
    },
    /** DUST **/
    dust: {
        buildCommand: 'node DustjsCompile.js /assets/templates/source/ /assets/templates/compiled/'        
    },
    /** SCRIPTS **/
    scripts: {
        /* LINTER */
        linter: {
            exe: path.join('node_modules', '.bin', 'eslint'),
            files: [
                '/assets/source',
                'app.js'
            ].join(' '),
            options: '',            
            run: ''
        },
        /* CONCAT */
        concat: {
            input: [
                'assets/scripts/foundation-plugins/fdnt-plugin-1.js',
                'assets/scripts/foundation-plugins/fdnt-plugin-2.js',
                'assets/scripts/foundation-plugins/fdnt-plugin-3.js'
            ],
            output: 'assets/scripts/foundation-plugins/foundation.plugins.js'
        },
        tests: {
            // add paths here
        },
    },
    requirejs: {
        config: {
            baseUrl: "./assets/scripts/js",
            name: "index",
            out: "main-built.js",
            optimize: 'uglify'
        }
    }
}
config.scripts.linter.run = [config.scripts.linter.exe, config.scripts.linter.files, config.scripts.linter.options].join(' ');
config.requirejs.run = [config.requirejs.exe, config.requirejs.param, config.requirejs.optionsFile].join(' ');

if (isDevEnv) {
    config.sass = {
        inputConfig: {
            file: 'assets/scss/style.scss',
            outputStyle: 'expanded'
        },
        outputPath: path.join('assets','css','style.css')
    }
    config.requirejs.config.optimize = 'none';
} 

function execPromise(command) {
    return new Promise(function(resolve, reject) {
        exec(command, function(err, stdout, stderr) {
            if (err !== null) {
                return reject(err);
            } else if (stderr !== '') {
                return reject(stderr);
            }
            else {
                return resolve(stdout);
            }
        })
    })
}

function printExecOutput(err, stdout, stderr) {
    console.log(stdout);
    err || stderr ? console.log('ERROR:') : null;
    err ? console.log(err) : null;
    stderr ? console.log(err) : null;
}

function buildSass(watchPath) {
    console.log('\nSass file changed, running:');
    // handle the error being thrown from a failed SASS process (invalid syntax, missing file etc) or FS.write
    try {
        var result = sass.renderSync(config.sass.inputConfig);
        // should probably make these both sync, since this is a build, it's not like we want to do things out of sequence
        fs.writeFile(config.sass.outputPath, result.css, (fsError) => {
            fsError ? console.log('write file ERROR:', fsError) : console.log('style.css created');
        });
    } catch (error) {
        error.formatted ? console.log(error.formatted) : console.log(error);
    }
}

function buildDust(watchPath) {
    console.log('\nDust file changed:');
    execPromise(config.dust.buildCommand)
        .then(out => {
            console.log(out)
            console.log('Dust succesfully compiled');            
        }) 
        .catch(err => {
            console.log('Error compiling dust, please save again to recompile.');
            console.log(err);            
        }); 
}

function buildScripts(watchPath) {
    console.log('\nScript file changed:');
    exec(config.scripts.linter.run, printExecOutput);
    // I'm not going to setup an entire mocha testing framework, so since these commands works in SALT, it should here
    //exec('mocha-phantomjs -R spec -s webSecurityEnabled=false -p phantomjs.exe ./BuildSpec.html');
    //exec('../../ASA.Web/Sites/SALT/Content/node_modules/.bin/mocha" ../../ASA.Web/Sites/SALT/Content/test -R tap');
    //exec('"../../ASA.Web/Sites/SALT/Content/node_modules/.bin/mocha" ../../ASA.Web/Sites/SALT/Content/test --require blanket -R html-cov > ../../ASA.Web/Sites/SALT/Content/coverage.html');
    //concat(config.scripts.concat.input, config.scripts.concat.output);
    //exec(config.requirejs.run);
    requirejs.optimize(config.requirejs.config, function (buildResponse) {
        //buildResponse is just a text output of the modules
        //included. Load the built file for the contents.
        //Use config.out to get the optimized file contents.
        var contents = fs.readFileSync(config.out, 'utf8');
        console.log(contents);
    }, function(err) {
        //optimization err callback
        console.log(err);
    });
}

/**** Initialize watcher ****/
var watcher = chokidar.watch(
    ['assets/scss/', 'assets/templates/', 'assets/scripts/'], 
    {
        // ignore .dotfiles, compiled dir, and css dir
        ignored: /(^|.*[\/\\])(\..\w+|(compiled|css)\/\w*)/,        
        persistent: true
    }
);

/**** Run watcher ****/
watcher
    .on('change', watchPath => {
        /*** SASS File is changed ***/
        if (watchPath.indexOf(path.join('assets','scss')) !== -1) {
            buildSass(watchPath);
        }
        /*** DUST file is changed ***/
        else if (watchPath.indexOf(path.join('assets','templates')) != -1) {
            buildDust(watchPath);              
        }
        /*** JS file is changed ***/
        else if (watchPath.indexOf(path.join('assets','scripts')) != -1) {
            buildScripts(watchPath);
        } 
        /*** shouldn't be any other type of file in these folders, log to identify ***/
        else {
            console.log(watchPathpath);
        }
    });