var express = require("express"),
http = require('http'),
app = express(),
path = require("path"),
server = http.createServer(app),
listeningPort = 3000;

function restartServer() {
    server.close();
    console.log('Server closed. Reopening server at port 3000');
    server.listen(listeningPort);
}

app.get("/", function(req, res) {
    console.log('GETs at ', req.path);
    dust.render('page_parent', {name: 'car'}, function(err, out) {
        console.log('error', err);
        console.log('out', out);
        res.sendFile(path.join(__dirname, 'assets', 'html', 'index.html'));        
    })

});

console.log("listening on port 3000");
server.listen(listeningPort);
