const { Router } = require('express');
const authController = require('../controllers/authController');
const { retireToken, requireAuth } = require('../middleware/authMiddleware');

const router = Router();

router.post('/signup', authController.signup_post);
router.post('/signin', authController.login_post);
router.post('/exists', authController.checkUser); //checks if a user exists in database
router.get('/signout', requireAuth, retireToken);

module.exports = router;
