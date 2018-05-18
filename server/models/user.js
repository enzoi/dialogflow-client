const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
        validator: validator.isEmail,
        message: '{VALUE} is not a valid email'
    }
},
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{ 
    access: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    }
  }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

userSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });
};

userSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

var User = mongoose.model('User', userSchema);

module.exports = {User}
