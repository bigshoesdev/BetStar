
/**
  *
  * User Model
  */
  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;

  var WordSchema = new Schema({
    level: {type: String, "default": "primary"},
    data: {type: Array, "default": []},
    study_time: {type: String, "default": ""},
    test_mark: {type: Array, "default": []}
  }); 
  
  module.exports = mongoose.model('word', WordSchema);