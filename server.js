var 
port            = process.env.PORT || 3000,

express         = require('express'),
app             = express(),
http            = require('http').Server(app)
io              = require('socket.io')(http),
UUID            = require('node-uuid'),
moment          = require('moment'),

verbose         = false,

fs = require('fs'),
util = require('util');

// log
var 
logFileName   = __dirname + '/debug/' + moment().format('YYYY-MM-DD-HH-mm') + '.log';
logFile        = fs.createWriteStream(logFileName, {flags : 'w'});

// game stats
var
PASSCODE = 'mmp',
ROOM_LIST = ['room', 'dump'],
PLAYERS = {
    'room' : [], 
    'dump' : []
};

/* Express server set up. */

//The express server handles passing our content to the browser,
//As well as routing PLAYERS where they need to go. This example is bare bones
//and will serve any file the user requests from the root of your web server (where you launch the script from)
//so keep this in mind - this is not a production script but a development teaching tool.

//Tell the server to listen for incoming connections
http.listen(port, function(){
    for (var room in ROOM_LIST) {
        PLAYERS[room] = [];
    }
    log('\t :: * :: Listening on port ' + port );
});
  
//Log something so we know that it succeeded.

//By default, we forward the / path to index.html automatically.
app.get( '/', function( req, res ){ 
    res.sendFile( __dirname + '/index.html' );
});

io.on('connection', function(socket){
    
    var addedPlayer = false;

    log('a user connected');
    
    socket.on('login', function(data) {
        if(addedPlayer) return;

        socket.username = data.username;
        addedPlayer = true;
        
        var room = ROOM_LIST[data.passcode == PASSCODE ? 0 : 1];
        
        socket.join(room, () => {
            PLAYERS[room].push(data.username);
            log(data.username + ' joined room ' + room);
        });

        socket.emit('login success', {
            players: PLAYERS[room]
        });

        socket.to(room).emit('new player', {
            players: PLAYERS[room]
        });
    })
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
    logFile.write(util.format(d) + '\n');
    process.stdout.write(util.format(d) + '\n');
};

