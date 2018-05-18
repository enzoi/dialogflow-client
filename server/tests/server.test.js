const expect = require('expect');
const request = require('supertest');

const {app} = require('../server');
const {Message} = require('../models/message');

const messages = [{
    text: 'First test message',
    isSender: true
}, {
    text: 'Second test message',
    isSender: false
}]

beforeEach((done) => {
    Message.remove({}).then(() => {
        return Message.insertMany(messages);
    }).then(() => done());
});

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
});



