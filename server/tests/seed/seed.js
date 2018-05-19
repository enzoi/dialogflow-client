const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Message} = require('./../../models/message');
const {User} = require('./../../models/user');

const userOneId = new ObjectID()
const userTwoId = new ObjectID()
const users = [{
    _id: userOneId,
    email: 'ykim3544@gmail.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]
}, {
    _id: userTwoId,
    email: 'ytk007@gmail.com',
    password: 'userTwoPass'
}];

const messages = [{
    _id: new ObjectID(),
    text: 'First test message',
    isSender: true
}, {
    _id: new ObjectID(),
    text: 'Second test message',
    isSender: false
}];

const populateMessages = (done) => {
    Message.remove({}).then(() => {
        return Message.insertMany(messages);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo])
    }).then(() => done());
};

module.exports = {messages, populateMessages, users, populateUsers}