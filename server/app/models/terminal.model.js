
/**
  *
  * Week Model
  */

  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;

  var TerminalSchema = new Schema({
    terminal_no: {type: String, required: true, unique: true},
    agent_id: {type: String, required: true},
    default_type: {type: String, default: "Nap/Perm"},
    default_option: {type: String, default: "100-1"},
    default_under: {type: String, default: "U3"},
    credit_limit: {type: Number, default: "1000000"},
    min_stake: {type: Number, default: "1000"},
    max_stake: {type: Number, default: "10000"},
    options: {type: Array, default: []},
    unders: {type: Array, default: ["true", "true", "true", "true"]},
    status: {type: Boolean, default: true},
    password: {type: String},
    token: {type: String},
  }); 
  
  module.exports = mongoose.model('terminal', TerminalSchema);