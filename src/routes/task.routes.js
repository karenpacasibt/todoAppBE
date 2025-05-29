const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const taskController = require('../controllers/task.controller')

router.get('/', auth.verifyToken, taskController.getAll);
router.get('/:id', auth.verifyToken, taskController.getOne);
router.post('/', auth.verifyToken, taskController.create);
router.put('/:id', auth.verifyToken, taskController.update);
router.delete('/:id', auth.verifyToken, taskController.destroy);

module.exports = router;