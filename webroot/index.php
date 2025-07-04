<?php session_start(); ?>
<!DOCTYPE HTML>
<html lang="en">
<head>
	<title>The Webiverse</title>
	<meta charset="utf-8">
	<meta name="author" content="Jason Chavannes <jason.chavannes@gmail.com>" />
	<meta name="date" content="12/15/2012" />
	<script type="text/javascript">var SESSIONID = document.cookie.match(/PHPSESSID=([^;]+)/)[1];</script>

	<style type="text/css">
	body {
		background-color: #333;
		margin: 0px;
		overflow: hidden;
	}
	</style>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.9/jquery-ui.min.js"></script>
    <script type="text/javascript">
        const socketIOUrl = ('https:' == document.location.protocol) ? '' : 'http://' + document.location.hostname + ':8234/';
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = socketIOUrl + 'socket.io/socket.io.js';
        document.head.appendChild(script);
    </script>
</head>
<body>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/threejs/r83/three.min.js"></script>
    <script type="text/javascript" src="res/3p/helvetiker_regular.typeface.js"></script>
	<script type="text/javascript" src="res/Game.js"></script>
</body>
</html>
