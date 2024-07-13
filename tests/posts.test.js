const app = require('../app');
const request = require('supertest');
const Post = require('../models/Post');
const User = require('../models/User');
const { body } = require('express-validator');

const user = {
    username: 'watermelon',
    password: '123456'
}

const post = {
    content: 'DEMO post',
    media: 'https://i.pinimg.com/236x/41/7f/35/417f35f8df9ad27617954e00ab7b989f.jpg',
}

describe('Posts routes', () => {

    const agent = request.agent(app);
    let postId;

    beforeAll(async () => {
        const res = await request(app).post('/api/register').send(user);
        expect(res.status).toBe(200);

        await agent
            .post('/api/login')
            .send(user)
            .expect(200);

    });


    describe('POST create post', () => {
        it('should CREATE (POST) a post', async () => {
            const res = await agent.post('/api/posts').send(post).expect(201);

            postId = res.body.post._id
        })
    })


    describe('GET all posts for not logged in users', () => {

        it('should return all posts for not logged in users', async () => {
            const res = await request(app).get('/api/posts')
                .expect(200)

            expect(Array.isArray(res.body))
        })
    })


    describe('GET all posts for logged in users', () => {

        it('should return all posts for not logged in users', async () => {
            const res = await agent.get('/api/posts/user')
                .expect(200)

            expect(Array.isArray(res.body))
        })
    })

    describe('POST like a post', () => {

        it('should like a post', async () => {

            await agent.post(`/api/posts/like/${postId}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.like).toBe(true);
                });

        })
    })


    describe('POST unlike a post', () => {

        it('should remove a like from a post', async () => {

            await agent.post(`/api/posts/unlike/${postId}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.unlike).toBe(true);
                });
        })
    })



    describe('DELETE a post', () => {

        it('should remove a post', async () => {

            await agent.delete(`/api/posts/${postId}`).expect(200)
        })
    })


    afterAll(async () => {

        await agent.post('/api/logout');
        await User.findOneAndDelete({ username: user.username });

    });
});

