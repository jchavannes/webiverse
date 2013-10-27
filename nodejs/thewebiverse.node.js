/* Author: Jason Chavannes <jason.chavannes@gmail.com>
 * Dates: 12/15/2012 - 3/9/2013 */

// Load dependencies and create data stores
var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app).listen(8020),
    io = require('socket.io').listen(server),
    sockets = [],
    users = [],
    chatData = [];

// New connection
io.sockets.on('connection', function (socket) {

    socket.emit('hello');

	// Add connection to socket store
	var sockId = sockets.length,
        userId;
	sockets[sockId] = {id: sockId, socket: socket};

	// Get session key from client
    socket.on('setSession', function(data) {

		// Save session key to socket store
		sockets[sockId].sessionId = data.sessionId;

		// Check if user exists already
        userId = false;
		for (var i = 0; typeof users[i] != 'undefined'; i++) {
			if (users[i].sessionId == data.sessionId) {
				userId = i;
				users[i].sockId = sockId;
			}
		}

		// Create new user
		if (userId === false) {
			userId = users.length;

			// Set default information
			users[userId] = {
				id: userId,
				sessionId: data.sessionId,
				sockId: sockId,
				x: data.x,
				y: data.y,
				z: data.z
			}
		}

		// Save user id to socket store
		sockets[sockId].userId = userId;

		// Set / Refresh expiration
		refreshUser(userId);

		// Send user information to client
		socket.emit('getMyUserInfo', {id: userId});

        // Loop through all active users
		users.forEach(function(user) {
			if (!isActive(user.id)) return;

			// Send active users to new user
			socket.emit('getMove', {
				id: user.id,
				x: user.x,
				z: user.z,
				y: user.y
			});

			// Send new user to active users
			if (user.id != userId) {
                console.log(user);
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
	socket.on('sendMove', function(data) {
        if (typeof users[userId] == "undefined") return;
        refreshUser(userId);
        users[userId].x = data.x;
        users[userId].z = data.z;
        users[userId].y = data.y;

        // Send move to all clients (except sending client)
        users.forEach(function(user) {
            if (user.id != userId && isActive(user.id)) {
                sockets[user.sockId].socket.emit('getMove', {
                    id: userId,
                    x: data.x,
                    z: data.z,
                    y: data.y
                });
            }
        });
	});

	// Make inactive on disconnect
	socket.on('disconnect', function() {
        if (typeof users[userId] == "undefined") return;
        users[userId].active = false;

        // Send disconnect to all clients
        users.forEach(function(user) {
            if (isActive(user.id)) {
                sockets[user.sockId].socket.emit('userExit', {id: userId});
            }
        });
	});
});

// Add message to history and send
function sendMessage(id, msg, log) {
	var name;
	if (typeof log == 'undefined') {log = true;}
	if (typeof users[id] != 'undefined' && typeof users[id].name != 'undefined') {
		name = users[id].name;
	} else {
		name = "Server";
		id = -1;
	}
	if (log) {chatData.push({id: id, msg: msg, name: name});}
	users.forEach(function(user) {
		if (user.active) {
			sockets[user.sockId].socket.emit('newChat', {id: id, msg: msg, name: name});
		}
	});
}

function isActive(userId) {
	return users[userId].active && users[userId].expire > new Date().getTime();
}

// Update user expiration
function refreshUser(userId) {
	var now = new Date().getTime();
	if (typeof users[userId] != 'undefined') {
		users[userId].expire = now + 7200000;
		users[userId].active = true;
	}
}