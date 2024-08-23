const express = require('express');
const router = express.Router();
const { getAllUsers_get, getAUser_get, search_get, getAllDemoUsers_get } = require('../controllers/usersControllers');

// GET all USERS 
router.get('/users', getAllUsers_get);

router.get('/demo-users', getAllDemoUsers_get);

// GET a user
router.get('/users/:username', getAUser_get);

// GET search for users
router.get('/search', search_get);

module.exports = router;