const Router = require('express');
const userRouter = require('./userRouter');
const trainerRouter =  require('./trainerRouter');

const router = Router();

router.use('/user', userRouter);
router.use('/trainer', trainerRouter);

module.exports = router;
