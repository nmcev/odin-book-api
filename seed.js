const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const categories = [ 'city', 'people', 'sports', 'food', 'nightlife', 'business', 'transport'];

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

const numberOfUsers = 10;
async function createUser() {
    let users = [];

    for (let i = 0; i < numberOfUsers; i++) {

        let user = new User({
            username: faker.internet.userName(),
            name: faker.person.fullName(),
            password: '123456',
            profilePic: faker.image.avatarLegacy(),
            bio: faker.person.bio(),
            followers: [],
            following: [],
            repostedPosts: [],
            posts: [],
        });

        console.log(`Creating user ${i}...`);
        await user.save();
        users.push(user);
    }

    return users;
}


async function createPosts(users) {

    let posts = [];

    for (let i = 0; i < users.length; i++) {
        let numOfPosts = faker.number.int({ min: 1, max: 5 });

        for (let j = 0; j < numOfPosts; j++) {
            let randomUserIndex = faker.number.int({ min: 0, max: users.length - 1 });

            let post = new Post({
                author: users[i]._id,
                content: faker.lorem.lines(),
                likes: faker.number.int({ min: 0, max: 10 }),
                media: faker.image.urlLoremFlickr({category: getRandomCategory()}),
                createdAt: faker.date.recent(),
                comments: [],

            });

            console.log(`Creating post ${j}...`);
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

        let numOfFollowers = faker.number.int({ min: 2, max: 5 })


        let followers = users.filter(u => u._id !== user._id);

        for (let j = 0; j < numOfFollowers; j++) {
            const follower = followers[j];

            user.followers.push(follower._id);
        }
        await user.save();
    }
}

async function createFollowing(users) {
    for (let i = 0; i < users.length; i++) {
        let user = users[i];

        let followings = users.filter(u => u._id !== user._id);
        let numOfFollowing = faker.number.int({ min: 2, max: 5 })

        for (let j = 0; j < numOfFollowing; j++) {
            const following = followings[j];

            user.following.push(following._id);
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

            user.repostedPosts.push(repostedPost._id);

        }
        await user.save();
    }
}


async function seedDB() {
    try {
        let users = await createUser();

        await createFollowers(users);
        await createFollowing(users);

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

