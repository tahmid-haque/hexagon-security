const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.post('/signup', authController.signup_post);
router.post('/signin', authController.login_post);
router.post('/exists', authController.checkUser);

module.exports = router;
