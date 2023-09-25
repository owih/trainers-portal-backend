const Router = require('express');
const userController = require('../controllers/userController');
const middleWareAuthCheck = require('../middleware/authMiddleWare');

const router = Router();

router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.get('/auth', middleWareAuthCheck, userController.check);

module.exports = router;
