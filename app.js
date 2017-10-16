var express = require("express"),
http = require('http'),
app = express(),
path = require("path"),
dust = require('dustjs-linkedin'),
listeningPort = 3000;

var config = require('./config');
config(app);

app.disable('x-powered-by');

// serve static files
app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.get("/", function(req, res) {
    console.log('GETs at ', req.path);
    //res.sendFile(path.join(__dirname, 'assets', 'html', 'index.html'));        
    res.render('page_parent', {name: "Alan"});
});

console.log("listening on port 3000");
app.listen(listeningPort);
