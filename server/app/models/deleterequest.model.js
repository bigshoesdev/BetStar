
/**
  *
  * Week Model
  */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeleteRequestSchema = new Schema({
  bet_id: { type: String, require: true, unique: true },
  status: { type: String, default: "Waiting" },
  terminal_id: { type: String, require: true },
  agent_id: { type: String, require: true },
});

module.exports = mongoose.model('deleterequest', DeleteRequestSchema);