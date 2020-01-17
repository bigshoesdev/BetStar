
/**
  *
  * Bet Model
  */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema({
  game_no: {type: Number, require: true},
  week_no: {type: Number, require: true},
  home_team: {type: String, require: true},
  away_team: {type: String, require: true},
  home_score: {type: Number, default: 0},
  away_score: {type: Number, default: 0},
  status: {type: Boolean, default: true},
  checked: {type: Boolean, default: false},
});

module.exports = mongoose.model('games', GameSchema);