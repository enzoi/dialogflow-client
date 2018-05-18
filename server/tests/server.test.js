const expect = require('expect');
const request = require('supertest');

const {app} = require('../server');
const {Message} = require('../models/message');

beforeEach((done) => {
    Message.remove({}).then(() => done());
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

                    Message.find().then((messages) => {
                        expect(messages.length).toBe(1);
                        expect(messages[0].text).toBe(text);
                        done();
                    }).catch((e) => done(e));
                });
        });
    });
});



