var chokidar = require('chokidar');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec, child;
var concat = require('concat');

var sass = require('node-sass');

var isDevEnv = process.argv.length === 3 && process.argv[2] === '--dev';

/**** Configuration Objects ****/
var sassConfig = {
        inputConfig: {
            file: 'assets/scss/style.scss',
            outputStyle: 'compressed'
        },
        outputPath: path.join('assets','css','style.css')
}
var dustConfig = {
    buildCommand: 'node DustjsCompile.js /assets/templates/source/ /assets/templates/compiled/'
}
var LinterConfig = {
    execPath: './node_modules/.bin/eslint',
    lintingOptions: [].join(' '),
    lintingPath: [
        '/assets/source',
        'app.js'
    ].join(' '),
    runCommand: ''
}
LinterConfig.runCommand = LinterConfig.execPath + LinterConfig.lintingOptions + LinterConfig.lintingPath;
var concatConfig = {
    concatFiles: [
        'assets/scripts/foundation-plugins/fdnt-plugin-1.js',
        'assets/scripts/foundation-plugins/fdnt-plugin-2.js',
        'assets/scripts/foundation-plugins/fdnt-plugin-3.js'
    ],
    output: 'assets/scripts/foundation-plugins/foundation.plugins.js'
}
if (isDevEnv) {
    sassConfig = {
        inputConfig: {
            file: 'assets/scss/style.scss',
            outputStyle: 'compressed'
        },
        outputPath: path.join('assets','css','style.css')
    }
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
            console.log('\nSass file changed, running:');
            // handle the error being thrown from a failed SASS process (invalid syntax, missing file etc) or FS.write
            try {
                var result = sass.renderSync(sassConfig.inputConfig);
                // should probably make these both sync, since this is a build, it's not like we want to do things out of sequence
                fs.writeFile(sassConfig.outputPath, result.css, (fsError) => {
                    fsError ? console.log('write file ERROR:', fsError) : console.log('style.css created');
                });
            } catch (error) {
                error.formatted ? console.log(error.formatted) : console.log(error);
            }
        }
        /*** DUST file is changed ***/
        else if (watchPath.indexOf(path.join('assets','templates')) != -1) {
            console.log('\nDust file changed:');
            exec(dustConfig.buildCommand, function(err, stdout, stderr) {
                console.log(stdout);
                if (err || stderr) {
                    console.log('Error:', err, '\n', stderr);                    
                }
            });                
        }
        /*** JS file is changed ***/
        else if (watchPath.indexOf(path.join('assets','scripts')) != -1) {
            console.log('\nScript file changed:');
            concat(concatConfig.concatFiles, concatConfig.output);  
        } 
        /*** shouldn't be any other type of file in these folders, log to identify ***/
        else {
            console.log(watchPathpath);
        }
    });
