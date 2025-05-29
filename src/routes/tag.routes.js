const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const tagController = require('../controllers/tag.controller');

router.get('/', verifyToken, tagController.getAll);
router.get('/:id', verifyToken, tagController.getOne);
router.post('/', verifyToken, tagController.create);
router.put('/:id', verifyToken, tagController.update);
router.delete('/:id', verifyToken, tagController.destroy);

module.exports = router;
