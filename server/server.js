require('./config/config');
const bcryptCompare = require('./hashing');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Message } = require('./models/message');
const {authenticate} = require('./middleware/authenticate');
const fs = require('fs');

const port = process.env.PORT || 3000;

const app = express();

app.use((req, res, next) => {
    var now = new Date().toString();
    var log = `${now}: ${req.method} ${req.url}`;

    console.log(log);
    fs.appendFile('server.log', log + '\n', (err) => {
        if (err) {
            console.log('Unable to append to server.log.');
        }
    });
    next()
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcome to my website');
});

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    
    User.findByCredentials(body.email, body.password)
        .then((user) => {
            return user.generateAuthToken().then((token) => {
                res.header('x-auth', token).send(user);
            });
        }).catch((e) => {
            res.status(400).send();
        });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/messages', (req, res) => {
    var body = _.pick(req.body, ['text', 'isSender']);
    var message = new Message(body);

    message.save().then((message) => {
        res.send(message);
    }).catch((e) => {
        res.status(400).send(e);
    })
});

app.get('/messages', (req, res) => {
    Message.find().then((messages) => {
        res.send({messages});
    }, (e) => {
        res.status(400).send(e);
    })
});

app.get('/messages/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Message.findById(id).then((message) => {
        if (!message) {
            return res.status(404).send(); 
        }
        res.send({message});
    }).catch((e) => {
        res.status(400).send();
    });
});

// fulfillment webhook from dialogFlow
app.post('/action', (req, res) => {
    // receive query from dialogFlow for fulfillment
    // return data to dialogFlow
    res.send('Asked to get weather data');
});

app.listen(port, () => {
    console.log(`Server started on ${port}...`);
});

module.exports.app = app;