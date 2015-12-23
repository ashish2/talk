
var socket;
var myUserName;
var userdata = {};

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
	float = "pull-left";
	if ( msg.source == myUserName )
		float = "pull-right";
		
	if ( msg.target == "All" ) {
		//html = "<span class='allMsg'>" + msg.source + " : " + msg.message + "</span><br />";
		html = "<div class='row'><div class='col-md-3 msg "+float+"'>" + msg.source + ': ' + msg.message + "<span></span></div></div>";
	} else {
		// It is a private message to me
		//html = "<span class='privMsg'>" + msg.source + " (P) : " + msg.message + "</span><br/>";
		html = "<div class='row'><div class='col-md-3 msg "+float+"'>" + msg.source + ': ' + msg.message + "<span></span></div></div>";
	}
	//$("#msgWindow").append(html);
	div_id = "#all";
	
	$(".chatWindow.active" + div_id).append(html);
}


function handleUserLeft( msg ) {
	$("select#users option[value='"+ msg.userName +"']").remove();
}

//socket = io.connect("http://localhost:3000", {transports:['websocket']} );
socket = io.connect("http://localhost:3000");

//console.log("io");
//console.log(io);
//console.log("socket");
//console.log(socket);

function setFeedback(fb) {
	$("span#feedback").html(fb);
}

function setUsername() {
	myUserName = $("input#userName").val();
	myUserName = userdata.name;
	socket.emit('set_username', myUserName, function(data) { console.log('emit set_username', data); } );
	//console.log("Set user name as " + myUserName );
}

function sendMessage() {
	// FTM, talk to the 0th key of user, later we'll change.
	//var trgtUser = $('select#users').val();
	var s = angular.element(document.getElementById('usersctrl')).scope();
	var trgtUser = s.users[0].name;
	
	socket.emit('message', 
	{
		"inferSrcUser": true,
		"source": userdata.name,
		"message": $('#msg').val(),
		//"target": trgtUser
		"target": "All"
	});
	
	$('input#msg').val("");
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
function appendNewUser(clientsData, notify) {
	//console.log("UsersCtrl", UsersCtrl);
	//console.log("in appendNewUser func");
	//console.log("uName, notify", uName, notify);
	//console.log("app", app);
	//console.log("app.controller", app.controller);
	
	//$('select#users').append( $('<option></option>').val(uName).html(uName) );
	
	//if ( notify && ( myUserName !== uName ) && ( myUserName !== 'All' )  ) {
		//$('span#msgWindow').append("<span class='adminMsg'> ==>" + uName + " just joined <==<br />" );
		
		
		// if its -1, then push in it
		//all_sockets.push( user.sock_id);
		
		// & Add into angular
		s = angular.element(document.getElementById('usersctrl')).scope();
		s.$apply( function() {
			//s.users.push(user);
			s.users = [];
			
			s.users = clientsData;
		});
		
		console.log("in appendNewUser func", clientsData );
		
		
	//}
	
}


$( function() {
	
	enableMsgInput(false);
	
	//
	$("#login").on("click", function(e) {
		e.preventDefault();
		userdata.name = $("#name").val();
		userdata.email = $("#email").val();
		$("#logindiv").hide(700, function() {
			$("#mainchat").show(700, function(){
				setUsername();
			});
		});
	});
	//-
	
	//socket.on('userJoined', function(user) {
	socket.on('userJoined', function(clientsData) {
		//appendNewUser(msg.userName, true);
		//appendNewUser(user, true);
		appendNewUser(clientsData, true);
	});
	
	socket.on('userLeft', function(msg) {
		handleUserLeft(msg);
	});
	
	socket.on("message", function(msg) {
		//console.log("new mess arrived: msg", msg);
		appendNewMessage(msg);
	});
	
	socket.on("welcome", function( msg) {
		//setFeedback("<span style='color: green'> Username available. You can begin chatting.</span>");
		setCurrentUsers(msg.currentUsers);
		enableMsgInput(true);
		enableUsernameField(false);
	});
	
	socket.on("error", function(msg) {
		if(msg.userNameInUse) {
			setFeedback("<span style='color: red'> Username already in use. Try another name. </span>");
		}
	});
	
	//$("input#userName").change(setUsername);
	//$("input#userName").keypress( function(e) {
		//if(e.keyCode == 13 ) {
			//setUsername();
			//e.stopPropagation();
			//e.stopped = true;
			//e.preventDefault();
		//}
	//});
	
	
	$(".userList").on("click", function(e) {
		console.log(e);
		e.preventDefault();
		div_id = $(e.target).data("socket");
		div_id_elem = "#" + $(e.target).data("socket");
		allChatWindows = $("#allChatWindows");
		
		//if ( allChatWindows.find(div_id_elem).length == 0 ) 
		//{
			//allChatWindows.children(".chatWindow").removeClass("active").hide();
			//html = "<div class='col-md-9 chatWindow active' id='"+div_id+"'></div>";
			//allChatWindows.append(html);
			//allChatWindows.find(".active").show();
		//}
		
		
	});
	
	$("#submit").click(function(e){
		sendMessage();
		e.stopped = true;
		e.preventDefault();
	});
	
	
});











