const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var messageSchema = Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { 
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    isSender: {
        type: Boolean,
        required: true
    },
    created_at: {
        type: Number,
        default: Date()
    }
  });
  
  var Message = mongoose.model('Message', messageSchema);

  module.exports = {Message}