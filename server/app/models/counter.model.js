
/**
  *
  * Counter Model
  */

  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;

  var CounterSchema = new Schema({
    counter_name: {type: String, unique: true, require: true},
    counter: {type: Number, default: 0},
  }); 
  
  module.exports = mongoose.model('counter', CounterSchema);