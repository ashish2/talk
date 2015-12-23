
//var clients = new Object();
var clients = {};
var clientsData = [];
var socketsOfClients = {};

io.sockets.on('connection', function(socket) {
	
	console.log("===socket===", socket);
	console.log("===socket rooms===", socket.rooms);
	
	socket.on('set_username', function(userName) {
		console.log( "sock on set_username called");
		
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
		
		console.log ("emitted message", msg);
		
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
			
			console.log("io.sockets.connected------", io.sockets.connected);
			
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
	socket.on('join_room', function(my_sock, partner_sock){
		room = my_sock + "_" + partner_sock;
		if( !socket.rooms[room] )
		{
			//socket.room = room;
			socket.join(room);
			// select the partners socket, & connect him too
			io.sockets.connected[partner_sock].join(room);
		}
	});
	
	// Leave Room
	socket.on('leave_room', function(my_sock, partner_sock){
		room = my_sock + "_" + partner_sock;
		// let the socket leave this room, & also let the partner leave that room
		if(socket.rooms[room])
			//socket.leave(socket.room);
			socket.leave(socket.rooms[room]);
	});
	//-
	
	// Send in a particular room
	socket.on("room_chat", function( room_name, msg ) {
		socket.broadcast.to(room_name).emit('function', 'data1', 'data2');
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
	console.log("socketsOfClients");
	console.log(socketsOfClients);
	console.log(Object.keys(socketsOfClients));
	
	//Object.keys(socketsOfClients).forEach( function(sId) {
		
		//console.log("uName", uName);
		//console.log("io-----", io);
		//console.log("socketsOfClients-----", socketsOfClients);
		//console.log("io.sockets-----", io.sockets);
		//console.log("io.sockets.sockets-----", io.sockets.sockets);
		//console.log("sId-----", sId);
		//console.log("io.sockets.sockets[sId]-----", io.sockets.sockets[sId]);
		
		//io.sockets.connected[sId].emit('userJoined', { "userName": uName} );
		// FTM (shudnt be io.emit, io.emit emits to all, just select sockets.sId & emit to only those)
		// FTM
		sId = clients[uName];
		//-
		//io.sockets.emit('userJoined', { "userName": socketsOfClients[sId] } );
		//var user = {};
		//user["name"] = uName;
		//user["socket"] = sock_id;
		
		io.sockets.emit('userJoined', clientsData );
		
	//});
	
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


