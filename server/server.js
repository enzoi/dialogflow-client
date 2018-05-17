require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Message } = require('./models/message');
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
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);
    user.save().then((user) => {
        res.send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
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