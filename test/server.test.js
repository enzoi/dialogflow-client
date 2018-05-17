const request = require('supertest');

var app = require('../server').app;

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
});



