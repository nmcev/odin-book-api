const request = require('supertest');
const app = require('../app');
const Post = require('../models/Post');
const User = require('../models/User');

const post = {
    content: "just demo",
    media: 'https://i.pinimg.com/236x/41/7f/35/417f35f8df9ad27617954e00ab7b989f.jpg',
};

const user = {
    username: 'foo',
    password: '123456'
};

describe("Comments routes", () => {

    const agent = request.agent(app);
    let postId;
    let userId;
    let commentId;

    beforeAll(async () => {

        const res = await request(app).post('/api/register').send(user);
        expect(res.status).toBe(200);

        const loginRes = await agent.post('/api/login').send(user);
        expect(loginRes.status).toBe(200);

        userId = loginRes.body.user._id;

        const postRes = await agent.post('/api/posts').send(post);
        expect(postRes.status).toBe(201);

        postId = postRes.body.post._id;
    });

    describe('POST create new comment', () => {
        it('should create new comment', async () => {
            const res = await agent.post('/api/comments').send({
                content: "demo comment",
                postId,
                userId
            });

            expect(res.status).toBe(201);
            expect(res.body.commented).toBe(true);

            commentId = res.body.comment._id;
        });
    });


    describe('DELETE a comment', () => {
        it('should delete a comment', async () => {
            const res = await agent.delete(`/api/comments/${postId}/${commentId}`);

            expect(res.body.deleted).toBe(true);
        });
    });

    afterAll(async () => {
        await agent.post('/api/logout');
        await User.findOneAndDelete({ username: user.username });
        await Post.findByIdAndDelete(postId);
    });


});

