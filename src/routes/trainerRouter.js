const Router = require('express');
const cartController = require('../controllers/trainerController');
const authMiddleWare = require('../middleware/authMiddleWare');

const router = Router();

router.get('/:id', authMiddleWare, cartController.get);
router.post('/', authMiddleWare, cartController.update);
router.put('/', authMiddleWare, cartController.create);
router.delete('/', authMiddleWare, cartController.delete);

module.exports = router;
