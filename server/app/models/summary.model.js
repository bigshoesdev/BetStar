
/**
  *
  * Week Model
  */

  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;

  var SummarySchema = new Schema({
	terminal_no: {type: String, required: true},
	agent_id: {type: String, required: true},
	week_no: {type: Number, required: true},
	option: {type: String, require: true},
	summary_id: {type: String, require: true, unique: true},
	commission: {type: Number, default: 0},
	sales: {type: Number, default: 0},
	payable: {type: Number, default: 0},
	win: {type: Number, default: 0},
  }); 
  
  module.exports = mongoose.model('summary', SummarySchema);