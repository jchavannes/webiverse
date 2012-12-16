/* Author: Jason Chavannes <jason.chavannes@gmail.com>
 * Date: 12/15/2012 */

// Load dependencies and create data stores
var io = require('socket.io').listen(8020);
var sockets = [];
var users = [];	
var chatData = [];
var checkPointsTimeout;

// New connection
io.sockets.on('connection', function (socket) {

	// Add connection to socket store
	var id = sockets.length;
	sockets[id] = {id: id, socket: socket}

	// Send socket id to client
	sockets[id].socket.emit('getSocket', {sockId: id});

	// Get session key from client
	sockets[id].socket.on('setSession', function(data) {

		// Save session key to socket store
		sockets[data.sockId].sessionId = data.sessionId;
		var userId = false;

		// Check if user exists already
		for(var i = 0; typeof users[i] != 'undefined'; i++) {
			if(users[i].sessionId == data.sessionId) {
				userId = i;
				users[i].sockId = data.sockId;
			}
		}

		// Create new user
		if(userId === false) {
			userId = users.length;

			// Set detault information
			users[userId] = {
				id: userId,
				sessionId: data.sessionId,
				sockId: data.sockId,
				active: true,
				x: data.x,
				z: data.z,
				y: data.y
			}
		}

		// Save user id to socket store
		sockets[data.sockId].userId = userId;

		// Set / Refresh expiration
		refreshUser(userId);

		// Send user information to client
		sockets[data.sockId].socket.emit('getMyUserInfo', {
			id: userId
		});

		var now = new Date().getTime();
		users.forEach(function(user) {

			// Send all users to client
			sockets[data.sockId].socket.emit('getMove', {
				id: user.id,
				x: user.x,
				z: user.z,
				y: user.y
			});

			// Send new user to all clients
			if(user.id != userId) {
				sockets[user.sockId].socket.emit('getMove', {
					id: users[userId].id,
					x: users[userId].x,
					z: users[userId].z,
					y: users[userId].y
				});
			}
		});
	});

	// Get move from client
	sockets[id].socket.on('sendMove', function(data) {
		if (typeof users[data.id] != 'undefined') {
			refreshUser(data.id);
			users[data.id].x = data.x;
			users[data.id].z = data.z;
			users[data.id].y = data.y;

			// Send move to all clients (except sending client)
			users.forEach(function(user) {
				if(user.id != data.id) {
					sockets[user.sockId].socket.emit('getMove', {
						id: data.id,
						x: data.x,
						z: data.z,
						y: data.y
					})
				}
			});
		}
	});

	// Make inactive on disconnect
	var disconnect = sockets[id];
	sockets[id].socket.on('disconnect', function() {
		if(typeof users[sockets[disconnect.id].userId] != 'undefined') {
			users[sockets[disconnect.id].userId].active = false;

			// Send disconnect to all clients
			users.forEach(function(user) {
				if(user.active) {
					sockets[user.sockId].socket.emit('userExit', {id: disconnect.userId});
				}
			});
			sendMessage(sockets[disconnect.id].userId, "has disconnected.<br/>", false);
		}
	});
});

// Add message to history and send
function sendMessage(id, msg, log) {
	var name;
	if(typeof log == 'undefined') {log = true;}
	if(typeof users[id] != 'undefined' && typeof users[id].name != 'undefined') {
		name = users[id].name;
	} else {
		name = "Server";
		id = -1;
	}
	if(log) {chatData.push({id: id, msg: msg, name: name});}
	users.forEach(function(user) {
		if(user.active) {
			sockets[user.sockId].socket.emit('newChat', {id: id, msg: msg, name: name});
		}
	});
}

// Update user expiration
function refreshUser(userId) {
	var now = new Date().getTime();
	if(typeof users[userId] != 'undefined') {
		users[userId].expire = now + 1000000;
		users[userId].active = true;
	}
}

// Get current race time
function getTime(time) {
	var min = parseInt(time/60000);
	var sec = parseInt((time - min*60000)/1000);
	var milli = ""+parseInt((time - sec*1000 - min*60000)/10);
	if(min > 0) {
		if(sec.length < 2) {sec = "0"+sec;}
		sec = min+":"+sec;
	}
	if(milli.length < 2) {milli = "0"+milli;}
	return ""+sec+"."+milli;
}