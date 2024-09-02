const mongoose = require('mongoose');
const User = require('./models/User');
const DemoUser = require('./models/DemoUser');
const Post = require('./models/Post');
const Notification = require('./models/Notification')
const Comment = require('./models/Comment');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const categories = ['city', 'people', 'sports', 'food', 'nightlife', 'business', 'transport'];

const getRandomCategory = () => {
    const randomIndex = Math.floor(Math.random() * categories.length);
    return categories[randomIndex];
};


async function connectMongo() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/odin-book');

        await mongoose.connection.db.dropDatabase();

        console.log('Connected to MongoDB and cleared the database.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}
connectMongo().catch(err => console.error(err));

const numberOfUsers = 5;
async function createUser() {
    let users = [];

    for (let i = 0; i < numberOfUsers; i++) {

        const userInfo = {
            username: faker.internet.userName(),
            name: faker.person.fullName(),
            password: '123456',
            profilePic: faker.image.urlPicsumPhotos(),
            bio: faker.person.bio(),

        }
        let user = new User({

            username: userInfo.username,
            name: userInfo.name,
            password: userInfo.password,
            profilePic: userInfo.profilePic,
            bio: userInfo.bio,
            followers: [],
            following: [],
            repostedPosts: [],
            posts: [],
        });

        let demo = new DemoUser({

            username: userInfo.username,
            name: userInfo.name,
            password: userInfo.password,
            profilePic: userInfo.profilePic,
            bio: userInfo.bio,
            followers: [],
            following: [],
            repostedPosts: [],
            posts: [],

        });


        console.log(`Creating user ${i}...`);
        await user.save();
        await demo.save()
        users.push(user);
    }

    return users;
}


async function createPosts(users) {

    let posts = [];

    for (let i = 0; i < users.length; i++) {
        let numOfPosts = faker.number.int({ min: 1, max: 5 });

        for (let j = 0; j < numOfPosts; j++) {
            const numOfLikes = faker.number.int({ min: 1, max: users.length })
            const likes = [];


            let post = new Post({
                author: users[i]._id,
                content: faker.lorem.lines(),
                likes: likes,
                media: faker.image.urlLoremFlickr({ category: getRandomCategory() }),
                createdAt: faker.date.recent(),
                comments: [],

            });

            for (let k = 0; k < numOfLikes; k++) {
                let randomUserIndex = faker.number.int({ min: 0, max: users.length - 1 });

                const likedBy = users[randomUserIndex]._id
                if (!likes.includes(likedBy)) {
                    likes.push(users[randomUserIndex]._id)
                    const newNotification = new Notification({
                        type: 'like',
                        user: likedBy,
                        recipient: users[i]._id,
                        post: post._id
                    })
                    await newNotification.save();
                } else {
                    k--;
                }

            }

            post.likes = likes;

            console.log(`Creating post number ${j} for user ${i}}`);
            await post.save();
            posts.push(post);

            users[i].posts.push(post._id);
            await users[i].save();
        }
    }
    return posts;
}

async function createComments(users, posts) {
    let comments = [];

    for (let i = 0; i < posts.length; i++) {
        let numComments = faker.number.int({ min: 0, max: 5 });

        for (let j = 0; j < numComments; j++) {
            let randomUserIndex = faker.number.int({ min: 0, max: users.length - 1 });

            let comment = new Comment({
                content: faker.lorem.sentence(),
                createdAt: faker.date.recent(),
                author: users[randomUserIndex]._id,
                post: posts[i]._id,
            });

            console.log(`Creating comment ${j + 1} for post ${i + 1}...`);
            await comment.save();
            comments.push(comment);

            let post = posts[i];
            post.comments.push(comment._id);
            await post.save();
        }
    }

    return comments;
}



async function createFollowers(users) {
    for (let i = 0; i < users.length; i++) {
        let user = users[i];

        let numOfFollowers = faker.number.int({ min: 2, max: 5 });

        // Log the current user and the number of followers
        console.log(`Creating followers for user ${user.username}. Number of followers: ${numOfFollowers}`);

        let followers = users.filter(u => u._id.toString() !== user._id.toString());

        // Log the filtered followers
        console.log(`Filtered followers for user ${user.username}: ${followers.map(f => f.username)}`);

        followers = followers.sort(() => Math.random() - 0.5);

        for (let j = 0; j < numOfFollowers; j++) {
            const follower = followers[j];

            if (follower) {
                // Log the current follower
                console.log(`Processing follower ${follower.username}`);

                if (!user.followers.includes(follower._id)) {
                    user.followers.push(follower._id);
                    follower.following.push(user._id);

                    const newNotification = new Notification({
                        type: 'follow',
                        user: follower._id,
                        recipient: user._id
                    });

                    await newNotification.save();
                    await follower.save();
                }
            } else {
                console.error(`Follower at index ${j} is undefined`);
            }
        }
        await user.save();
    }
}





async function createRepostedPosts(users, posts) {
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        let repostedPosts = posts.filter(p => p.author.toString() !== user._id.toString()); // remove users' posts 

        const numOfResPosts = faker.number.int({ min: 2, max: 5 });

        for (let j = 0; j < numOfResPosts; j++) {

            const repostedPost = repostedPosts[j];

            if (!user.repostedPosts.includes(repostedPost._id)) {
                user.repostedPosts.push(repostedPost._id);

                const newNotification = new Notification({
                    type: 'repost',
                    user: user._id,
                    recipient: repostedPost.author,
                    post: repostedPost._id
                })

                await newNotification.save();
            }
        }
        await user.save();
    }
}


async function seedDB() {
    try {
        let users = await createUser();

        await createFollowers(users);

        let posts = await createPosts(users);
        await createRepostedPosts(users, posts);

        await createComments(users, posts);

        console.log('Database seeding completed.');
        process.exit()
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit();
    }
}

seedDB();

