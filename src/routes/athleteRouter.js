const express = require("express");
const athleteController = require('../controllers/athleteController');
const authMiddleWare = require('../middleware/authMiddleWare');

const router = express.Router();

router.get('/:id', authMiddleWare, athleteController.get);
router.post('/', authMiddleWare, athleteController.update);

module.exports = router;
