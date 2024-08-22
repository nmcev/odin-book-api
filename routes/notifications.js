const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notificationsControllers')
const { isAuthenticated } = require('../auth/isAuth');

router.get('/notifications', isAuthenticated, getNotifications);

module.exports = router;

