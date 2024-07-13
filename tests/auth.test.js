const request = require('supertest');
const app = require('../app');
const User = require('../models/User');



const user = {
    username: 'demo',
    password: '123456',
    profilePic: 'https://i.pinimg.com/236x/41/7f/35/417f35f8df9ad27617954e00ab7b989f.jpg',
}



describe('AUTH routes', () => {
    let agent = request.agent(app)

    afterAll(async () => {
        // Clean up: Delete user after tests
        await User.findOneAndDelete({ username: user.username });
    });

    describe('/POST new account', () => {
        it('should POST new account', async () => {
            const res = await request(app).post('/api/register').send(user);

            expect(res.status).toBe(200);

        })

    })


    describe('/POST login', () => {

        it('should login the user', async () => {
            const res = await agent.post('/api/login').send({ username: user.username, password: user.password })
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('user');

        })
    })

    describe('/GET Authentication', () => {
        it('should visit authenticated route', async () => {

            const res = await agent.get('/api/auth')

            expect(res.status).toBe(200);
        })
    })

    describe('/POST Logout', () => {
        it('should logout', async () => {
            const res = await agent.post('/api/logout');

            expect(res.status).toBe(200);
        })
    })
})

