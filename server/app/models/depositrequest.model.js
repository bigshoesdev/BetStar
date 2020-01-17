
/**
  *
  * User Model
  */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DepositRequestSchema = new Schema({
  index: {type:Number, required: false},
  requester: { type: String, required: true, unique: false },
  request_accountno: { type: String, required: true},
  request_bankname: { type: String, required: true},
  request_type: { type: String, required: true, default: "Deposit" },
  request_amount: { type: Number, required: true },
  created_at: { type: Date, default: "" },
  status: { type: String, default: "Waiting" },
});

module.exports = mongoose.model('depositrequest', DepositRequestSchema);