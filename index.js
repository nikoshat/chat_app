const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
var time = require('express-timestamp') //timestamp
//const pathURL = new URL("file:///C:///Users/nikolaos.hatiras/Desktop/tr/project/index.html");
var obj = {
	"g": "1",
	"f": [1,2,3]
};


app.get('/', function(req, res) {
	console.log(req.timestamp)
  // logs moment
	fs.readFile('index.html', function(err, data){
		res.setHeader('Content-Type', 'text/html');
		if(err) {
			console.log('Error! ', err);
			res.statusCode = 500;
			res.send('error');
			return;
		}
		console.log(data);
		res.send(data);
	});
	console.log('here');
});

 
/* testing app.get and error handling on the front-end 
seems that URL object created above is not being properly accessed by  fs.access below 
app.get('/', function(req, res) {
	fs.readFile('idndex.html', function(err, data){
		res.setHeader('Content-Type', 'text/html');
		fs.access(pathURL, fs.F_OK, (err) => { //tried to check pathurl declared above
			if (err) {
				res.statusCode = 123;
				res.send('error');
				console.log('File does not exist, sorry bro! ', err);
				return;
			}})

		console.log(data);
		res.send(data);
	});
	console.log('here');
});
testing ends here
*/ 

var MESSAGES_TO_SEND = 20;
var messages = [];

io.sockets.on('connection', function(socket) {
	socket.on('username', function(username) {
		io.emit('New user', {timestamp:new Date(), username:username});
		socket.username = username;
		io.emit('is_online', '🔵 <i>' + socket.username + ' has just joined the chat..</i>');
	});

	socket.on('disconnect', function(username) {
		io.emit('is_online', '🔴 <i>' + socket.username + ' has left the chat..</i>');
	})

	socket.on('chat_message', function(message) {
		console.log('message: ', message);
		messages.push({'user':socket.username, 'message': message});
		io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
	});

	var start = 0;
	if(messages.length > MESSAGES_TO_SEND)
		start = messages.length - MESSAGES_TO_SEND;
	
	for(var i = start; i < messages.length; ++i) {
		io.emit('chat_message', '<strong>' + messages[i].user + '</strong>: ' + messages[i].message);
	}
});

const server = http.listen(7272, function() {
    console.log('application listening on port *:7272');
});

process.on('uncaughtException', function(err) {
	console.log(err);
});
