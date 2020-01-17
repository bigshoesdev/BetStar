
/**
  *
  * User Model
  */
  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;

  var SuffixSchema = new Schema({
    suffix: {type: String, "default": ""},
  }); 
  
  module.exports = mongoose.model('suffix', SuffixSchema);