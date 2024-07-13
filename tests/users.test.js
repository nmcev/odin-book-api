const request = require('supertest');
const app = require('../app');
const User = require('../models/User')

describe('User Routes', () => {
    describe('GET /users', () => {
        it('should GET all users', async () => {
            const response = await request(app).get('/api/users');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        })
    })


    describe('GET a user', () => {
        it('should GET a user', async () => {
            const user = await User.findOne({ username: 'xxxx' })
            const res = await request(app).get(`/api/users/${user.id}`);


            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id', user.id);
        })
    })
})