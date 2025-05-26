const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tag.controller');

router.get('/', tagController.getAll);
router.get('/:id', tagController.getOne);
router.post('/', tagController.create);
router.put('/:id', tagController.update);
router.delete('/:id', tagController.destroy);

module.exports = router;
