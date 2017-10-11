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
},
gameLobby = { games : {}, gameCount:0 };

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
    
    socket.on('new user', function(data) {
        if(addedPlayer) return;

        socket.username = data.username;
        socket.id = uuid();
        addedPlayer = true;

        socket.emit('new user added', {
            userId: socket.id
        });
    });

    /**
     * @param data.player
     * @param data.player.username
     * @param data.player.userId
     */
    socket.on('new game', function(data) {
        // already in a game
        if (socket.gameId != undefined) return;

        var gameId = uuid();
        var newGame = {
            id : gameId,
            owner : data.player,
            members : []
        }

        socket.join(gameId, () => {
            this.gameLobby[gameId] = newGame;
            gameCount++;
            socket.gameId = gameId
        });

        socket.emit('new game created', {
            gameId : gameId
        })
    });

    /**
     * @param data.player
     * @param data.player.username
     * @param data.player.userId
     * @param data.gameId
     */
    socket.on('join game', function(data) {
        var game = this.gameLobby[data.gameId];
        if(socket.username != undefined && 
            socket.id != undefined &&
            game != undefined) {
            
            socket.join(game.id, () => {
                game.members.push(data.player);
            });

            socket.to(game.id).emit('new player', {
                members: game.members
            });
        }
        
    });
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
