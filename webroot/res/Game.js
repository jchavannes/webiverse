new(function() {

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
		};
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
		$(init);

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

			addFloor();
			setInterval(update, 1000/30);
		}
		function addSphere() {
			var geometry = new THREE.SphereGeometry(5);
			var material = new THREE.MeshLambertMaterial({color:0xffffff});
			var sphere = new THREE.Mesh(geometry, material);
			sphere.position.y += 5;
			scene.add(sphere);
			return sphere;
		}
        function addText(player, textString) {
            /*var textGeometry = new THREE.TextGeometry(textString, {
                size: 80,
                height: 20,
                curveSegments: 2,
                font: "helvetiker"
            });
            textGeometry.computeBoundingBox();

            var centerOffset = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
            var material = new THREE.MeshBasicMaterial({color: 0x556655, overdraw: true});
            var text = new THREE.Mesh(textGeometry, material);

            text.position.x = centerOffset;
            text.position.y = 100;
            text.position.z = 0;

            text.rotation.x = 0;
            text.rotation.y = Math.PI * 2;

            player.add(text);

            scene.add(player);*/
            var bitmap = document.createElement('canvas');
            var g = bitmap.getContext('2d');
            bitmap.width = 100;
            bitmap.height = 100;
            g.font = 'Bold 20px Arial';

            g.fillStyle = 'white';
            g.fillText(textString, 0, 20);
            g.strokeStyle = 'black';
            g.strokeText(textString, 0, 20);

            var text = new THREE.Texture(bitmap);
            player.add(text);

        }
		function addFloor() {
			var geometry = new THREE.CubeGeometry(500, 5, 1000);
			var material = new THREE.MeshLambertMaterial({color: 0x556655});
			var floor = new THREE.Mesh(geometry, material);
			floor.position.y -= 40;
			scene.add(floor);
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

					var curY = ((playerCords[i].cords.y - playerCords[i].startCords.y) / playerCords[i].steps) * (playerCords[i].steps - playerCords[i].stepsLeft) + playerCords[i].startCords.y;
					var direction = (curY % (2*Math.PI)) / (2*Math.PI) * 360 + 180;
					playerCords[i].leftEye.position.x = player[i].position.x+Animate.vectorX(direction+20)*20;
					playerCords[i].leftEye.position.z = player[i].position.z+Animate.vectorZ(direction+20)*20;
					playerCords[i].rightEye.position.x = player[i].position.x+Animate.vectorX(direction-20)*20;
					playerCords[i].rightEye.position.z = player[i].position.z+Animate.vectorZ(direction-20)*20;
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
		};
		this.vectorZ = function(direction) {
			return Math.cos(Math.PI * (direction/180));
		};
		this.addPlayer = function(cords) {
			var geometry = new THREE.CylinderGeometry(10, 25, 75);
			var material = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff});
			var id = player.length;
			player[id] = new THREE.Mesh(geometry, material);
			playerCords[id] = {
				active: false,
				cords: cords,
				startCords: cords,
				leftEye: addSphere(),
				rightEye: addSphere()
			};
			player[id].position.x = cords.x;
			player[id].position.z = cords.z;
			scene.add(player[id]);
            addText(player[id], "Jason");
			return id;
		};
		this.removePlayer = function(id) {
			playerHide(id);
		};
		playerShow = function(id) {
			player[id].visible = true;
			playerCords[id].leftEye.visible = true;
			playerCords[id].rightEye.visible = true;
		};
		playerHide = function(id) {
			player[id].visible = false;
			playerCords[id].leftEye.visible = false;
			playerCords[id].rightEye.visible = false;
		};
		this.movePlayer = function(id, cords) {
			if (!player[id].visible) playerShow(id);
			$.extend(playerCords[id], {
				active: true,
				cords: cords,
				startCords: Animate.playerCords(id),
				steps: 6,
				stepsLeft: 6
			});
		};
		this.playerCords = function(id) {
            var cords;
			if (typeof id == 'undefined') {
                cords = {x:camera.position.x, z:camera.position.z, y:camera.rotation.y};
			} else if (typeof player[id] != 'undefined') {
				cords = {x:player[id].position.x, z:player[id].position.z, y:playerCords[id].cords.y};
			} else {
                return false;
            }
            return {
                x: parseInt(cords.x),
                y: parseInt(cords.y * 100) / 100,
                z: parseInt(cords.z)
            };
		};
		this.setCamera = function(cords) {
			camera.position.x = cords.x;
			camera.position.z = cords.z;
			camera.rotation.y = cords.y;
		}
	});

	var Socket = new (function() {
		var user = {};
		var players = [];
		var init = function() {
			var socketUrl = "ws://";
			if (window.location.protocol == "https:") {
				socketUrl = "wss://";
			}
            socket = io.connect(socketUrl);
			socket.on('hello', function() {
				cords = Animate.playerCords();
				socket.emit('setSession', {sessionId:SESSIONID, x:cords.x, z:cords.z, y:cords.y});
			});
			socket.on('getMyUserInfo', function(data) {user.id = data.id;});
			socket.on('getMove', function(data) {
				if (data.id == user.id) {
					Animate.setCamera(data);
					return;
				}
				var userId = data.id;
				if (!isPlayer(userId)) {
					addPlayer(userId, data);
				}
				var animateId = getPlayer(userId);
				Animate.movePlayer(animateId, data);
			});
			socket.on('userExit', function(data) {
				Animate.removePlayer(getPlayer(data.id));
			});
			setInterval(checkPosition, 200);
		};
		function isPlayer(id) {
			return getPlayer(id) !== false;
		}
		function addPlayer(userId, data) {
			var id = players.length;
			players[id] = {
                userId: userId,
				animateId: Animate.addPlayer(data)
			}
		}
		function getPlayer(userId) {
			for (var i = 0; i < players.length; i++) {
				if (players[i].userId == userId) {
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
				Socket.sendMove(pos);
			}
		}
		this.sendMove = function(params) {
			params.id = user.id;
			socket.emit('sendMove', params);
		};
		$(document).ready(init);
	});
	$(window).resize(function() {window.location.href = "";});
});