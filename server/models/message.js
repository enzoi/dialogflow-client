var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    text: String
  });
  
  var Message = mongoose.model('Message', messageSchema);

  module.exports = {Message}