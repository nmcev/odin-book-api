const express = require('express');
const router = express.Router();
const { getAllUsers_get, getAUser_get } = require('../controllers/usersControllers');

// GET all USERS 
router.get('/users', getAllUsers_get);


// GET a user
router.get('/users/:userId', getAUser_get);

module.exports = router;