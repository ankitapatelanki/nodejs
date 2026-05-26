const express = require('express');
const router = express.Router();
const { register ,login,getUserData} = require('../controller/controller');
const { tokenVerification } = require('../middleware/middleware');

// Importing route handlers
// Define routes
router.post('/register', register);
router.post('/login', login);
router.get('/getuserdata/:id', tokenVerification, getUserData);

module.exports = router;
