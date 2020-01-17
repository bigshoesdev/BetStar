
/**
  *
  * User Model
  */

  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;
  
  var UserSchema = new Schema({
    user_id: {type: String, required: true},
    user_email: {type: String, required: true, unique: true},
    user_password: {type: String, required: true},
    user_token: {type: String, required: true},
    user_firstname: {type: String, "default": ""},
    user_lastname: {type: String, "default": ""},
    user_birthday: {type: Date, "default": ""},
    user_role: {type: String,  "default": ""},
    user_address: {type: String, "default": ""},
    user_city: {type: String, "default": ""},
    user_phonenumber: {type: String, "default": ""},
    user_staff: {type: String, "default": ""},
    user_avatar: {type: String, "default": ""},
    user_status: {type: Boolean, "default": true},
    user_createdat: {type: Date, "default": ""},
    user_wallet: {type: Number, "default": 0},
  }); 
  
  module.exports = mongoose.model('user', UserSchema);