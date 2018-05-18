const mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
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
        default: new Date()
    }
  });
  
  var Message = mongoose.model('Message', messageSchema);

  module.exports = {Message}