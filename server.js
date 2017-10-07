var 
port            = process.env.PORT || 3000,

express         = require('express'),
app             = express(),
http            = require('http').Server(app)
io              = require('socket.io')(http),
UUID            = require('node-uuid'),

verbose         = false,

fs = require('fs'),
util = require('util');

var 
log_file_name   = __dirname + '/debug/' + new Date().valueOf() + '.log',
log_file        = fs.createWriteStream(log_file_name, {flags : 'w'});

/* Express server set up. */

//The express server handles passing our content to the browser,
//As well as routing users where they need to go. This example is bare bones
//and will serve any file the user requests from the root of your web server (where you launch the script from)
//so keep this in mind - this is not a production script but a development teaching tool.

//Tell the server to listen for incoming connections
http.listen(port, function(){
    log('\t :: * :: Listening on port ' + port );
});
  
//Log something so we know that it succeeded.

//By default, we forward the / path to index.html automatically.
app.get( '/', function( req, res ){ 
    res.sendFile( __dirname + '/index.html' );
});

io.on('connection', function(socket){
    log('a user connected');
});

//This handler will listen for requests on /*, any file from the root of our server.
//See expressjs documentation for more info on routing.

app.get( '/*' , function( req, res, next ) {

    //This is the current file they have requested
    var file = req.params[0]; 

    //For debugging, we can track what files are requested.
    if(verbose) log('\t :: Express :: file requested : ' + file);

    //Send the requesting client the file.
    res.sendFile( __dirname + '/' + file );

}); //app.get *

function log (d) { //
    log_file.write(util.format(d) + '\n');
    process.stdout.write(util.format(d) + '\n');
};