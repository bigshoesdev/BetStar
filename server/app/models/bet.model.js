
/**
  *
  * Bet Model
  */

var mongoose = require('mongoose');
// var textSearch = require('mongoose-text-search');
var Schema = mongoose.Schema;

var BetSchema = new Schema({
  bet_id: {type: String, require: true, unique: true},
  player_id: { type: String, default: "" },
  terminal_id: { type: String, default: "" },
  agent_id: { type: String, default: "" },
  type: {type: String, default: "Nap/Perm"},
  option: { type: String, default: "" },
  under: { type: Array, default: [] },
  week: { type: Number, default: "" },
  gamelist: { type: Array, default: [] },
  scorelist: { type: Array, default: [] },
  apl: { type: Number, default: 0 },
  stake_amount: { type: Number, default: 0 },
  status: { type: String, default: "Active" },
  win_result: { type: String, default: "" },
  won_amount: { type: Number, default: 0 },
  ticket_no: { type: String, },
  bet_time: { type: Date, default: "" },
});

// BetSchema.plugin(textSearch);
BetSchema.index({bet_id: 'text'});
BetSchema.index({ticket_no: 'text'});
// BetSchema.index({'$**': 'text'});

module.exports = mongoose.model('bets', BetSchema);