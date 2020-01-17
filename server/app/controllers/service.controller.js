'use strict';

var model_user = require('server/app/models/user.model');
var env_config = require('server/config/development');
		
exports.token_generator = function(length)
{
	var text = '';
	
	var charset="abcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*";

	for( var i = 0; i < length; i++)
		text += charset.charAt(Math.floor(Math.random() * charset.length));
	return text;
}


