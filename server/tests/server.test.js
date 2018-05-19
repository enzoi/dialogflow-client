const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {User} = require('../models/user');
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

    describe('GET /users/me', () => {
        it('should return user if authenticated', (done) => {
            request(app)
                .get('/users/me')
                .set('x-auth', users[0].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toBe(users[0]._id.toHexString());
                    expect(res.body.email).toBe(users[0].email);
                })
                .end(done);
        });

        it('should return 401 if not authenticated', (done) => {
            request(app)
                .get('/users/me')
                .expect(401)
                .expect((res) => {
                    expect(res.body).toEqual({});
                })
                .end(done);
        });
    });

    describe('POST /users', () => {
        it('should create a user', (done) => {
            var email = 'test@test.com';
            var password = 'password'

            request(app)
                .post('/users')
                .send({email, password})
                .expect(200)
                .expect((res) => {
                    expect(res.headers['x-auth']).toExist();
                    expect(res.body._id).toExist();
                    expect(res.body.email).toBe(email);
                })
                .end((err) => {
                    if (err) {
                        return done()
                    }

                    User.findOne({email}).then((user) => {
                        expect(user).toExist();
                        expect(user.password).toNotBe(password);
                        done();
                    }).catch((e) => done(e));
                });
        });

        it('should return validation errors if request invalid', (done) => {
            var email = 'wrongEmail';
            
            request(app)
                .post('/users')
                .send({email})
                .expect(400)
                .end(done);
        });

        it('should not create user if email in use', (done) => {
            request(app)
                .post('/users')
                .send({
                    email: users[0].email, 
                    password: 'userOnePass'
                })
                .expect(400)
                .end(done)
        }) ;
    })

    describe('POST /users/login', () => {
        it('should login user and return auth token', (done) => {
            request(app)
                .post('/users/login')
                .send({
                    email: users[1].email, 
                    password: users[1].password
                })
                .expect(200)
                .expect((res) => {
                    expect(res.headers['x-auth']).toExist();
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    User.findById(users[1]._id).then((user) => {
                        expect(user.tokens[0]).toInclude({
                            access: 'auth',
                            token: res.headers['x-auth']
                        });
                        done();
                    }).catch((e) => done(e));
                });
        });

        it('should reject invalid login', (done) => {
            request(app)
                .post('/users/login')
                .send({
                    email: users[1].email + 1, 
                    password: users[1].password
                })
                .expect(400)
                .expect((res) => {
                    expect(res.headers['x-auth']).toNotExist();
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    User.findById(users[1]._id).then((user) => {
                        expect(user.tokens.length).toBe(0);
                        done();
                    }).catch((e) => done(e));
                });
        });  
    });

    describe('DELETE /users/me/token', () => {
        it('should remove auth token on logout', (done) => {
            request(app)
                .delete('/users/me/token')
                .set('x-auth', users[0].tokens[0].token)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    User.findById(users[0]._id).then((user) => {
                        expect(user.tokens.length).toBe(0);
                        done()
                    }).catch((e) => done(e));
                });
        });
    });
});



