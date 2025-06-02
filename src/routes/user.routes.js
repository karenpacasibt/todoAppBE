const { Router } = require('express')
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware');
const router = Router()

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', authMiddleware.verifyToken, userController.getProfile);

module.exports = router;