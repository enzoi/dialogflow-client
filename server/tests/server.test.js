const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Message} = require('../models/message');
const {messages, populateMessages, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateMessages);

describe('Server', () => {
    describe('GET /', () => {
        it('should return welcome response', (done) => {
            request(app)
                .get('/')
                .expect(200)
                .expect('Welcome to my website')
                .end(done);
        });
    });

    describe('POST /messages', () => {
        it('should create a new message', (done) => {
            var text = 'New message';
            var isSender = true;

            request(app)
                .post('/messages')
                .send({text, isSender})
                .expect(200)
                .expect((res) => {
                    expect(res.body.text).toBe(text);
                    expect(res.body.isSender).toBe(true);
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    Message.find({text, isSender}).then((messages) => {
                        expect(messages.length).toBe(1);
                        expect(messages[0].text).toBe(text);
                        done();
                    }).catch((e) => done(e));
                });
        });

        it('should not create a message with invalid data', (done) => {
            request(app)
                .post('/messages')
                .send({})
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    Message.find().then((messages) => {
                        expect(messages.length).toBe(2);
                        done();
                    }).catch((e) => done(e));
                });
        });
    });

    describe('GET /messages', () => {
        it('should get all messages', (done) => {
            request(app)
                .get('/messages')
                .expect(200)
                .expect((res) => {
                    expect(res.body.messages.length).toBe(2);
                })
                .end(done);
        });
    });

    describe('GET /messages/:id', () => {
        it('should get specific message by id', (done) => {
            request(app)
                .get(`/messages/${messages[0]._id.toHexString()}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.message.text).toBe(messages[0].text);
                })
                .end(done);
        });

        it('should return 404 if message not found', (done) => {
            const hexId = new ObjectID().toHexString();

            request(app)
                .get(`/messages/${hexId}`)
                .expect(404)
                .end(done);
        });

        it('should return 404 if non-object ids', (done) => {
            request(app)
                .get('/messages/12345')
                .expect(404)
                .end(done);
        });
    });
});



