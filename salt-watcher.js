var chokidar = require('chokidar');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec, child;

var sass = require('node-sass');

var isDevEnv = process.argv.length === 3 && process.argv[2] === '--dev';

// Initialize watcher.
var watcher = chokidar.watch(
    ['assets/scss/', 'assets/templates/', 'assets/scripts/'], 
    {
        // ignore .dotfiles, compiled dir, and css dir
        ignored: /(^|.*[\/\\])(\..\w+|(compiled|css)\/\w*)/,        
        persistent: true
    }
);

// just for recording during debugging purposes
var log = console.log.bind(console);

watcher
    .on('change', watchPath => {
        /*** SASS File is changed ***/
        if (watchPath.indexOf(path.join('assets','scss')) !== -1) {
            console.log('\nSass file changed, running:');
            // handle the error being thrown from a failed SASS process (invalid syntax, missing file etc) or FS.write
            try {
                var result = sass.renderSync({
                    file: 'assets/scss/style.scss',
                    outputStyle: 'compressed',
                });
                // should probably make these both sync, since this is a build, it's not like we want to do things out of sequence
                fs.writeFile(path.join('assets','css','style.css'), result.css, (fsError) => {
                    if (fsError) {
                        console.log('write file ERROR:', fsError);                                
                    } else {
                        console.log('style.css created')
                    }
                });
            } catch (error) {
                if (error.formatted) {
                    console.log(error.formatted);
                } else {
                    console.log(error);
                }
            }    
        }
        /*** DUST file is changed ***/
        else if (watchPath.indexOf(path.join('assets','templates')) != -1) {
            console.log('\nDust file changed:');
            var dustCommand = 'node DustjsCompile.js /assets/templates/source/ /assets/templates/compiled/';
            exec(dustCommand, function(err, stdout, stderr) {
                console.log(stdout);
                if (err || stderr) {
                    console.log('Error:', err, '\n', stderr);                    
                }
            });   
            /*
                // read the dust file changed
                var src = fs.readFileSync(watchPath, 'utf8');            
                // compile/register the dust file
                var compiled = dust.compile(src, path.basename(watchPath));
                dust.loadSource(compiled);
                // create the output path
                var pathRelativeToSourceDir = path.dirname(path.relative(path.join('assets', 'templates', 'source'), watchPath));
                var dirPath = path.join('assets','templates','compiled', pathRelativeToSourceDir);
                // create the output directory
                mkdirp.sync(dirPath);
                // write the compiled JS file to the output path
                fs.writeFileSync(path.join(dirPath, path.basename(watchPath, path.extname(watchPath)) + '.js'), compiled);

                dust.render(path.basename(watchPath), {name: 'car'}, function(err, out) {
                    console.log(err);
                    console.log(out);
                })         
                restartServer();
            */                
        }
        /*** JS file is changed ***/
        else if (watchPath.indexOf(path.join('assets','scripts')) != -1) {
            console.log('\nScript file changed:');
        } 
        /*** shouldn't be any other type of file in these folders, log to identify ***/
        else {
            console.log(watchPathpath);
        }
    });
