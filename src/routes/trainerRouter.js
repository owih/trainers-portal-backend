const express = require("express");
const trainerController = require('../controllers/trainerController');
const authMiddleWare = require('../middleware/authMiddleWare');

const router = express.Router();

router.get('/:id', authMiddleWare, trainerController.get);
router.post('/', authMiddleWare, trainerController.update);

module.exports = router;
