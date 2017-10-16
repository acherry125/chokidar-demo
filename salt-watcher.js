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
                'assets/scripts/js',
                'app.js'
            ].join(' '),
            options: '',            
            run: ''
        },
        /* CONCAT */
        concat: {
            input: [
                'assets/scripts/js/foundation-plugins/foundation-plugin-1.js',
                'assets/scripts/js/foundation-plugins/foundation-plugin-2.js',
                'assets/scripts/js/foundation-plugins/foundation-plugin-3.js'
            ],
            output: 'assets/scripts/js/foundation-plugins/foundation.plugins.js'
        },
        tests: {
            // add paths here
        },
    },
    requirejs: {
        config: {
            baseUrl: "./assets/scripts/js",
            name: "index",
            out: "./assets/scripts/OptimizedJS/main.js",
            optimize: 'uglify'
        }
    }
}
config.scripts.linter.run = [config.scripts.linter.exe, config.scripts.linter.files, config.scripts.linter.options].join(' ');
config.requirejs.run = [config.requirejs.exe, config.requirejs.param, config.requirejs.optionsFile].join(' ');

if (isDevEnv) {
    config.sass.outputStyle = 'expanded';
    config.requirejs.config.optimize = 'none';
} 

function execPromise(command) {
    return new Promise(function(resolve, reject) {
        exec(command, function(err, stdout, stderr) {
            if (err !== null) {
                return reject({"err": err, "out": stdout});
            } else if (stderr !== '') {
                return reject({"err": stderr, "out": stdout});
            }
            else {
                return resolve(stdout);
            }
        })
    })
}

function buildSass() {
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

function buildDust() {
    console.log('\nDust file changed:');
    execPromise(config.dust.buildCommand)
        .then(out => {
            out ? console.log(out) : null;
            console.log('Dust succesfully compiled');
            return;            
        }) 
        .catch(res => {
            console.log('Error compiling dust, please save again to recompile.');
            console.log(res.out);            
            console.log(res.err);
        }); 
}

function buildScripts() {
    console.log('\nScript file changed:');
    execPromise(config.scripts.linter.run)
        .catch(res => {
            errorMsg = res.out ? res.out : res.err;
            return Promise.reject(errorMsg);
        })
        .then(out => {
            console.log(out);
            console.log('Concating.');
            return concat(config.scripts.concat.input, config.scripts.concat.output)
        })
        .then(out => {
            // insert mocha exec's commented out below here
            console.log('Optimizing with requireJS.')
            requirejs.optimize(config.requirejs.config, 
                buildResponse => {
                    console.log(buildResponse);
                    console.log('Scripts succesfully built.')
                }, 
                err => {
                    console.log(err);
                });            
        })
        .catch(err => {
            console.log('Error building scripts. Fix errors and rebuild.')
            console.log(err);
        })
    // I'm not going to setup an entire mocha testing framework, so since these commands works in SALT, it should here
    //exec('mocha-phantomjs -R spec -s webSecurityEnabled=false -p phantomjs.exe ./BuildSpec.html');
    //exec('../../ASA.Web/Sites/SALT/Content/node_modules/.bin/mocha" ../../ASA.Web/Sites/SALT/Content/test -R tap');
    //exec('"../../ASA.Web/Sites/SALT/Content/node_modules/.bin/mocha" ../../ASA.Web/Sites/SALT/Content/test --require blanket -R html-cov > ../../ASA.Web/Sites/SALT/Content/coverage.html');
}

rimraf.sync(path.join(__dirname, 'assets', 'css'));
mkdirp(path.join(__dirname, 'assets', 'css'));
buildSass();
rimraf.sync(path.join(__dirname, 'assets', 'templates', 'compiled'));
buildDust();
rimraf.sync(path.join(__dirname, 'assets', 'scripts', 'OptimizedJS'));
buildScripts();

if (!isDevEnv) {
    console.log(isDevEnv);
    return;
}

/**** Initialize watcher ****/
var watcher = chokidar.watch(
    ['assets/scss/', 'assets/templates/', 'assets/scripts/'], 
    {
        // ignore .dotfiles, compiled dir, and css dir, and foundation.plugins.js
        ignored: /(^|.*[\/\\])(\..\w+|(compiled|css|OptimizedJS)\/\w*)|foundation.plugins.js/,        
        persistent: true
    }
);

/**** Run watcher ****/
watcher
    .on('change', watchPath => {
        /*** SASS File is changed ***/
        if (watchPath.indexOf(path.join('assets','scss')) !== -1) {
            buildSass();
        }
        /*** DUST file is changed ***/
        else if (watchPath.indexOf(path.join('assets','templates')) != -1) {
            buildDust();              
        }
        /*** JS file is changed ***/
        else if (watchPath.indexOf(path.join('assets','scripts')) != -1) {
            buildScripts();
        } 
        /*** shouldn't be any other type of file in these folders, log to identify ***/
        else {
            console.log(watchPathpath);
        }
    });