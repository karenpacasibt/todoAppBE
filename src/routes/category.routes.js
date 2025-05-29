const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const categoryController = require('../controllers/category.controller');


router.get('/', verifyToken, categoryController.getAll);
router.get('/:id', verifyToken, categoryController.getOne);
router.post('/', verifyToken, categoryController.create);
router.put('/:id', verifyToken, categoryController.update);
router.delete('/:id', verifyToken, categoryController.destroy);

module.exports = router;
