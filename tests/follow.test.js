const app = require('../app');
const request = require('supertest');
const User = require('../models/User');

const user = {
    username: 'newDemo',
    password: '123456'
};

describe('Follow Routes', () => {
    let agent = request.agent(app);

    beforeAll(async () => {
        const res = await request(app).post('/api/register').send(user);
        expect(res.status).toBe(200);

        await agent
            .post('/api/login')
            .send(user)
            .expect(200);

        targetUserId = '668e90eb6c910bf4a0b1f5f3';
    });

    describe('POST follow a user', () => {
        it('should follow a user', async () => {

            await agent
                .post(`/api/follow/${targetUserId}`)
                .expect(200);

        });
    });


    describe('POST unfollow a user', () => {
        it('should unfollow a user', async () => {

            await agent
                .delete(`/api/unfollow/${targetUserId}`)
                .expect(200);

        });
    });

    afterAll(async () => {
        await agent.post('/api/logout');
        await User.findOneAndDelete({ username: user.username });
    });
});
