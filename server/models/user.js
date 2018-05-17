var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
  _id: Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
},
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
});

var User = mongoose.model('User', userSchema);

module.exports = {User}
