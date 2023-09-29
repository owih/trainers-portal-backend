const express = require("express");
const userController = require('../controllers/userController');
const authMiddleWare = require('../middleware/authMiddleWare');
const checkRoleMiddleWare = require('../middleware/checkRoleMiddleWare');
const {rolesWithCreatePermission, rolesWithDeletePermission, rolesWithUpdatePermission} = require("../assets/roleRules");
// const mainUserValidation = require('../middleware/mainUserValidation');

const router = express.Router();

// router.post('/registration', mainUserValidation, userController.registration);
router.post('/login', userController.login);
router.get('/auth', authMiddleWare, userController.check);
router.get('/:id', authMiddleWare, userController.getWithRoleInfo);
router.post('/create', authMiddleWare, checkRoleMiddleWare(rolesWithCreatePermission), userController.create);
router.delete('/delete', authMiddleWare, checkRoleMiddleWare(rolesWithDeletePermission), userController.delete);
router.post('/update', authMiddleWare, checkRoleMiddleWare(rolesWithUpdatePermission), userController.update);

module.exports = router;
