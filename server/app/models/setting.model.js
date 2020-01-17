
/**
  *
  * Setting Model
  */

  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;

  var SettingSchema = new Schema({
    current_week: {type: Number, default: ""},
    risk_manager: {type: Array, default: {username:"",email:"",phonenumber:"",address:""}},
  }); 
  
  module.exports = mongoose.model('setting', SettingSchema);