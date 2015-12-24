
var socket;
var myUserName;
var userdata = {};
var active_friend_to_chat;
var current_room;
var chat_type;
var msg;

// Dangerous this one, you just can not store all_sockets on a each clients browser
var all_sockets = [];

function enableMsgInput(enable) {
	$('input#msg').prop('disabled', !enable);
}

function enableUsernameField(enable) {
	$('input#userName').prop('disabled', !enable);
}

function appendNewMessage(msg) {
	var html;
	float = "pull-right";
	
	
	// It is a private message to me
	html = "<div class='row'><div class='col-md-3 msg from-me"+ " "+float+"'><span><b>" + msg.source + '</b>: ' + msg.message + "</b></span></div></div>";
	
	active_friend_to_chat_div = "#" + active_friend_to_chat;
	div_id = active_friend_to_chat_div;
	$(".chatWindow" + div_id).append(html);
}

function friendAppendNewMessage(msg) {
	console.log("friendAppendNewMessage msg", msg);
	var html;
	float = "pull-left";
	if ( msg.source == myUserName )
		float = "pull-right";
	
	// It is a private message to me
	html = "<div class='row'><div class='col-md-3 msg from-them" + " "+float+"'><span><b>" + msg.source + '</b>: ' + msg.message + "</span></div></div>";
	
	active_friend_to_chat_div = "#" + msg.target;
	div_id = active_friend_to_chat_div;
	$(".chatWindow" + div_id).append(html);
}

function handleUserLeft( msg ) {
	$("select#users option[value='"+ msg.userName +"']").remove();
}

//socket = io.connect("http://localhost:3000", {transports:['websocket']} );
socket = io.connect("http://localhost:3000");

function setFeedback(fb) {
	$("span#feedback").html(fb);
}

function setUserData() {
	myUserName = $("input#userName").val();
	myUserName = userdata.name;
	userdata.socket = socket.id;
	socket.emit('set_username', myUserName, function(data) { console.log('emit set_username', data); } );
}

function prepareMsg(){
	msg = {
		"inferSrcUser": true,
		"source": userdata.name,
		"message": $('#msg').val(),
		//"target": trgtUser
		//"target": active_friend_to_chat
		"target": userdata.socket
	}
}

function sendMessage() {
	// FTM, talk to the 0th key of user, later we'll change.
	//var trgtUser = $('select#users').val();
	
	//socket.emit('message', 
	//{
		//"inferSrcUser": true,
		//"source": userdata.name,
		//"message": $('#msg').val(),
		//"target": "All"
	//});
	
	console.log( "current_room", current_room, "socket", socket, "active_friend_to_chat", active_friend_to_chat );
	
	// broadcast is undefined
	socket.emit(chat_type, current_room, msg
	);
	
}

function setCurrentUsers(usersStr) {
	$('select#users >option').remove();
	appendNewUser('All', false)
	JSON.parse(usersStr).forEach( function(name) {
		appendNewUser(name, false);
	});
	//$('select#users').val('All').attr('selected', true);
}

//function appendNewUser(uName, notify) {
function appendNewUser(clientsData, notify)
{
	
	//$('select#users').append( $('<option></option>').val(uName).html(uName) );
	
	//if ( notify && ( myUserName !== uName ) && ( myUserName !== 'All' )  ) 
	//{
		//$('span#msgWindow').append("<span class='adminMsg'> ==>" + uName + " just joined <==<br />" );
		
		
		// if its -1, then push in it
		//all_sockets.push( user.sock_id);
		
		// & Add into angular
		s = angular.element(document.getElementById('usersctrl')).scope();
		$.each(clientsData, function(i, v) {
			if( all_sockets.indexOf( v.socket) == -1 && v.socket != userdata.socket )
			{
				all_sockets.push(v.socket);
				s.$apply( function() {
					s.users.push(v);
				});
			}
		});
		
	//}
	
}


$( function() {
	
	enableMsgInput(false);
	
	// Sockets
	socket.on('userJoined', function(clientsData) {
		appendNewUser(clientsData, true);
	});
	
	socket.on('userLeft', function(msg) {
		handleUserLeft(msg);
	});
	
	socket.on("message", function(msg) {
		appendNewMessage(msg);
	});
	
	socket.on("welcome", function( msg) {
		setCurrentUsers(msg.currentUsers);
		enableMsgInput(true);
		enableUsernameField(false);
	});
	
	socket.on("room_chat", function(msg) {
		// append msg here only, for me & for the target send the target friends socket_id where it will get appended for friend
		console.log( "this is what came from server room_chat", msg)
		friendAppendNewMessage(msg);
	});
	
	socket.on("error", function(msg) {
		if(msg.userNameInUse) {
			setFeedback("<span style='color: red'> Username already in use. Try another name. </span>");
		}
	});
	
	//-
	
	// jQuery - Dom
	// Login
	$("#login").on("click", function(e) {
		e.preventDefault();
		userdata.name = $("#name").val();
		userdata.email = $("#email").val();
		$("#logindiv").hide(700, function() {
			$("#mainchat").show(700, function(){
				setUserData();
			});
		});
	});
	//-
	
	mainUserList = $("#mainUserList");
	mainUserList.on("click", ".userList", function(e) {
		$(".userList").removeClass("active");
		$(e.target).addClass("active");
		active_friend_to_chat = $(e.target).data("socket");
		getCurrentRoom();
		join_room_fn();
		//console.log("active_friend_to_chat", active_friend_to_chat);
	});
	
	$("#submit").click(function(e){
		prepareMsg();
		appendNewMessage(msg);
		sendMessage();
		$('#msg').val("");
		e.stopped = true;
		e.preventDefault();
	});
	
	//-
	
	//$("input#userName").change(setUserData);
	//$("input#userName").keypress( function(e) {
		//if(e.keyCode == 13 ) {
			//setUserData();
			//e.stopPropagation();
			//e.stopped = true;
			//e.preventDefault();
		//}
	//});
	
	
});

function getCurrentRoom() {
	current_room = userdata.socket + "_" + active_friend_to_chat;
	if( active_friend_to_chat < userdata.socket )
		current_room = active_friend_to_chat + "_" + userdata.socket;
}

function join_room_fn(){
	chat_type = "room_chat";
	socket.emit("join_room", current_room, active_friend_to_chat );
}







