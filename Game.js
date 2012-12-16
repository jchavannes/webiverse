var Game = new(function() {
	var Controls = new (function() {

		this.keyDown = {

			left: false,
			right: false,
			up: false,
			down: false,
			keyW: false,
			keyA: false,
			keyS: false,
			keyD: false

		}

		$(document).keydown(function(e) {

			if (e.keyCode == 37) { Controls.keyDown.left = true; }
			else if (e.keyCode == 38) { Controls.keyDown.up = true; }
			else if (e.keyCode == 39) { Controls.keyDown.right = true; }
			else if (e.keyCode == 40) { Controls.keyDown.down = true; }
			else if (e.keyCode == 87) { Controls.keyDown.keyW = true; }
			else if (e.keyCode == 65) { Controls.keyDown.keyA = true; }
			else if (e.keyCode == 83) { Controls.keyDown.keyS = true; }
			else if (e.keyCode == 68) { Controls.keyDown.keyD = true; }
			else { return; }

			e.preventDefault();

		}).keyup(function(e) {

			if(e.keyCode == 37) { Controls.keyDown.left = false; }
			else if(e.keyCode == 38) { Controls.keyDown.up = false; }
			else if(e.keyCode == 39) { Controls.keyDown.right = false; }
			else if(e.keyCode == 40) { Controls.keyDown.down = false; }
			else if(e.keyCode == 87) { Controls.keyDown.keyW = false; }
			else if(e.keyCode == 65) { Controls.keyDown.keyA = false; }
			else if(e.keyCode == 83) { Controls.keyDown.keyS = false; }
			else if(e.keyCode == 68) { Controls.keyDown.keyD = false; }

		});

	});
	var Animate = new (function() {
		
		var camera, scene, renderer, cube = [], player = [], playerCords = [];
		init();

		function init() {
			camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
			camera.position.z = 50;

			scene = new THREE.Scene();
			scene.add(camera);

			var directionalLight = new THREE.DirectionalLight(0xffffff, 2);
			directionalLight.position.set(30, 30, 50);
			directionalLight.rotation.x -= 90;
			scene.add(directionalLight);

			directionalLight = new THREE.DirectionalLight(0xffffff, 2);
			directionalLight.position.set(-30, 30, -50);
			directionalLight.rotation.x += 90;
			scene.add(directionalLight);

			renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(renderer.domElement);

			addCube();
			addFloor();
			setInterval(update, 1000/30);
		}
		function addSphere() {
			var geometry = new THREE.SphereGeometry();
			var material = new THREE.MeshLambertMaterial({color:0xffffff});
			var sphere = new THREE.Mesh(geometry, material);
			scene.add(sphere);
			return sphere;
		}
		function addFloor() {
			var geometry = new THREE.CubeGeometry(500, 5, 1000);
			var material = new THREE.MeshLambertMaterial({color: 0x556655});
			var floor = new THREE.Mesh(geometry, material);
			floor.position.y -= 40;
			scene.add(floor);
		}
		function addCube() {
			var geometry = new THREE.CubeGeometry(25, 25, 25);
			var material = new THREE.MeshLambertMaterial({color: 0x3333dd});
			var id = cube.length;
			cube[id] = new THREE.Mesh(geometry, material);
			scene.add(cube[id]);
		}
		function update() {
			updateCube();
			updateCamera();
			updatePlayers();
			renderer.render(scene, camera);
		}
		function updateCamera() {
			var direction = (camera.rotation.y % (2*Math.PI)) / (2*Math.PI) * 360;

			if (Controls.keyDown.up || Controls.keyDown.keyW) {
				camera.position.z -= 5*Animate.vectorZ(direction);
				camera.position.x -= 5*Animate.vectorX(direction);
			}
			if (Controls.keyDown.down || Controls.keyDown.keyS) {
				camera.position.z += 5*Animate.vectorZ(direction);
				camera.position.x += 5*Animate.vectorX(direction);
			}
			if (Controls.keyDown.keyA) {
				camera.position.z += 5*Animate.vectorZ(direction-90);
				camera.position.x += 5*Animate.vectorX(direction-90);
			}
			if (Controls.keyDown.keyD) {
				camera.position.z += 5*Animate.vectorZ(direction+90);
				camera.position.x += 5*Animate.vectorX(direction+90);
			}
			if (Controls.keyDown.left) {
				camera.rotation.y += 0.1;
			}
			if (Controls.keyDown.right) {
				camera.rotation.y -= 0.1;
			}
		}
		function updatePlayers() {
			var max = player.length;
			for (var i = 0; i < max; i++) {
				if (typeof playerCords[i] != 'undefined' && playerCords[i].active) {
					player[i].position.x = ((playerCords[i].cords.x - playerCords[i].startCords.x) / playerCords[i].steps) * (playerCords[i].steps - playerCords[i].stepsLeft) + playerCords[i].startCords.x;
					player[i].position.z = ((playerCords[i].cords.z - playerCords[i].startCords.z) / playerCords[i].steps) * (playerCords[i].steps - playerCords[i].stepsLeft) + playerCords[i].startCords.z;
					playerCords[i].eyeball.position.x = player[i].position.x;
					playerCords[i].eyeball.position.z = player[i].position.z;
					playerCords[i].stepsLeft--;
					if (playerCords[i].stepsLeft == 0) {
						playerCords[i].active = false;
					}
				}
			}
		}
		function updateCube() {
			var max = cube.length;
			for (var i = 0; i < max; i++) {
				cube[i].rotation.x += 0.1;
				cube[i].rotation.y += 0.1;
			}
		}
		this.vectorX = function(direction) {
			return Math.sin(Math.PI * (direction/180));
		}
		this.vectorZ = function(direction) {
			return Math.cos(Math.PI * (direction/180));
		}
		this.addPlayer = function(cords) {
			var geometry = new THREE.CylinderGeometry(10, 25, 75);
			var material = new THREE.MeshLambertMaterial({color: 0x3333dd});
			var id = player.length;
			player[id] = new THREE.Mesh(geometry, material);
			playerCords[id] = {
				active: false,
				cords: cords,
				startCords: Animate.playerCords(id),
				eyeball: addSphere()
			};
			player[id].position.x = cords.x;
			player[id].position.z = cords.z;
			playerCords[id].eyeball.position.x = cords.x;
			playerCords[id].eyeball.position.z = cords.z;
			scene.add(player[id]);
			return id;
		}
		this.movePlayer = function(id, cords) {
			$.extend(playerCords[id], {
				active: true,
				cords: cords,
				startCords: Animate.playerCords(id),
				steps: 6,
				stepsLeft: 6
			});
		}
		this.isPlayer = function(id) {
			return typeof player[id] != 'undefined';
		}
		this.playerCords = function(id) {
			if (typeof id == 'undefined') {
				return {x:camera.position.x, z:camera.position.z, y:camera.rotation.y};
			} else if (typeof player[id] != 'undefined') {
				return {x:player[id].position.x, z:player[id].position.z};
			}
		}
		this.setCamera = function(cords) {
			camera.position.x = cords.x;
			camera.position.z = cords.z;
		}

	})
	var Socket = new (function() {
		var user = {};
		var players = [];
		var init = function() {
			socket = io.connect('ws://dev.socketgaming.com:8020');
			socket.on('getSocket', function(data) {
				cords = Animate.playerCords();
				socket.emit('setSession', {sessionId:SESSIONID, sockId:data.sockId, x:cords.x, z:cords.z});
			});
			socket.on('getMyUserInfo', function(data) {
				user.id = data.id;
			});
			socket.on('getMove', function(data) {
				if (data.id == user.id) {
					Animate.setCamera(data);
					return;
				}
				var socketId = data.id;
				if (!isPlayer(socketId)) {
					addPlayer(socketId, data);
				}
				var animateId = getPlayer(socketId);
				Animate.movePlayer(animateId, data);
			});
			socket.on('userExit', function(data) {
				// Remove player
			});
			setInterval(checkPosition, 200);
		}
		function isPlayer(id) {
			var id = getPlayer(id);
			return id !== false;
		}
		function addPlayer(socketId, data) {
			var id = players.length;
			players[id] = {
				socketId: socketId,
				animateId: Animate.addPlayer({x:data.x, z:data.z})
			}
		}
		function getPlayer(socketId) {
			for (var i = 0; i < players.length; i++) {
				if (players[i].socketId == socketId) {
					return players[i].animateId;
				}
			}
			return false;
		}
		this.getPlayer = getPlayer;
		var lastPos;
		function checkPosition() {
			var pos = Animate.playerCords();
			if (typeof lastPos == 'undefined' || pos.x != lastPos.x || pos.z != lastPos.z || pos.y != lastPos.y) {
				lastPos = pos;
				Socket.sendmove(pos);
			}
		}
		this.sendmove = function(params) {
			params.id = user.id;
			socket.emit('sendMove', params);
		}
		init();
	});
	$(window).resize(function() {
		window.location.reload();
	})
});