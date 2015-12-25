
//var clients = new Object();
var clients = {};
var clientsData = [];
var socketsOfClients = {};

io.sockets.on('connection', function(socket) {
	
	socket.on('set_username', function(userName) {
	
		// Is this an existing username
		if(clients[userName] === undefined){
			// Does not exists, so proceed
			clients[userName] = socket.id;
			clientsData.push({name: userName, socket: socket.id });
			socketsOfClients[socket.id] = userName;
			//userNameAvailable(socket.id, userName);
			userJoined(userName, socket.id);
		}
		else if( clients[userName] === socket.id) {
			// Ignore for now
		}
		else {
			//userNameAlreadyInUse(socket.id, userName);
		}
	});
	
	socket.on('message', function(msg) {
		
		var srcUser;
		if(msg.inferSrcUser) {
			// Infer user name based on the client id
			srcUser = socketsOfClients[socket.id];
		} else {
			srcUser = msg.source;
		}
		if(msg.target == "All") {
			// broadcast
			io.sockets.emit('message', 
				{
					"source": srcUser,
					"message": msg.message,
					"target": msg.target
				});
		} else {
			// Look up the socket id
			//io.sockets.sockets[clients[msg.target]].emit('message', 
			//io.sockets.sockets[clients[msg.target]].emit('message', 
			io.sockets.connected[clients[msg.target]].emit("message",
			{
				 "source": srcUser,
				 "message": msg.message,
				 "target": msg.target
			});
			
		}
	});
	
	socket.on('disconnect', function() {
		var uName = socketsOfClients[socket.id];
		delete socketsOfClients[socket.id];
		delete clients[uName];
		// Relay this msg to all the clients
		userLeft(uName);
	});
	
	// Room connection
	// Join Room
	socket.on('join_room', function(room, partner_sock){
		//console.log( "room, partner_sock", room, partner_sock);
		
		//room = my_sock + "_" + partner_sock;
		//console.log("socket.rooms.indexOf(room) == -1", socket.rooms.indexOf(room) == -1);
		if( socket.rooms.indexOf(room) == -1 && io.sockets.connected[partner_sock] != undefined )
		{
			socket.current_room = room;
			socket.join(room);
			// select the partners socket, & connect him too
			io.sockets.connected[partner_sock].join(room);
		}
		else
		{
			// Ignoring for now
		}
		
	});
	
	
	// Leave Room
	socket.on('leave_room', function(room, partner_sock){
		//room = my_sock + "_" + partner_sock;
		// let the socket leave this room, & also let the partner leave that room
		if(socket.rooms[room])
			//socket.leave(socket.room);
			socket.leave(socket.rooms[room]);
			// Remove the partner also from the room (*Maybe)
			//io.sockets.connected[partner_sock].join(room);
	});
	//-
	
	// Send in a particular room
	socket.on("room_chat", function( room_name, msg ) {
		//socket.broadcast.to(room_name).emit('function', 'data1', 'data2', msg);
		//socket.broadcast.to(socket.current_room).emit('room_chat', 'data1', 'data2', msg);
		socket.broadcast.to(room_name).emit("room_chat", msg);
		//io.sockets.in(room_name).emit("room_chat", msg);
	});
	//- 
	
	// Send a Broadcast to All
	socket.on("glob_chat", function( msg ) {
		io.sockets.emit('function', 'data1', 'data2');
	});
	//-
	
});

// Room connection
// now, it's easy to send a message to just the clients in a given room
//room = "vrrom";
//io.sockets.in(room).emit('message', {room: room} );

// this message will NOT go to the client defined above
//io.sockets.in('foobar').emit('message', 'anyone in this room yet?');

//
// to broadcast information to a certain room (excluding the client):
//socket.broadcast.to('room1').emit('function', 'data1', 'data2');
// to broadcast information globally:
//io.sockets.in('room1').emit('function', 'data1', 'data2');

//-


function userJoined(uName, sock_id) {
	io.sockets.emit('userJoined', clientsData );
}

function userLeft(uName) {
	io.sockets.emit('userLeft', { "userName": uName } );
}

//function userNameAvailable(sId, uName) {
	//setTimeout( function() {
		//io.sockets.connected[sId].emit('welcome', { "userName": uName, "currentUsers": JSON.stringify(Object.keys(clients) ) } );
	//}, 500);
//}

function userNameAlreadyInUse(sId, uName) {
	setTimeout(function() {
		io.sockets.connected[sId].emit('error', { "userNameInUse": true } );
	}, 500);
}


