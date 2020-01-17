var express  = require('express');
var app = express();
var mongoose =  require('mongoose');
var bodyParser = require('body-parser');
var methodOverride  = require('method-override');


require('rootpath')();
require('dotenv').config();


var env_config = require('server/config/development');

var port = 4100;

mongoose.connect(env_config.db);
console.log("---->Database connected successfully..." + env_config.db);



app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Headers", "Content-Type");
	res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
	next();
});

app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/client')); // set the static files location /public/img will be /img for users

// routes ==================================================
require('router')(app); // pass our application into our routes

// route to handle all angular requests

app.get('*', function (req, res) {
	res.sendfile('client/index.html');
});

// start app ===============================================
app.listen(port);	
console.log('Connected to node at ' + port); 			// shoutout to the user

module.exports = app; 						// expose app
