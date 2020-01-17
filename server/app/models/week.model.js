
/**
  *
  * Week Model
  */

  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;

  var WeekSchema = new Schema({
    week_no: {type: Number, required: true, unique: true},
    start_at: {type: Date, required: true},
    close_at: {type: Date, required: true},
    validity: {type: Date, required: true},
    void_bet: {type: Number, required: true},
    options: {type: Array, default: []},
    status: {type: String, default: "active"},
  }); 
  
  module.exports = mongoose.model('week', WeekSchema);