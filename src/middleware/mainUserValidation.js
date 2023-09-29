const {roles} = require("../assets/roleRules");
const ApiError = require("../error/ApiError");
module.exports = (req, res, next) => {
  try {
    const {
      login,
      role,
    } = req.body;

    console.log(req.body, 'req.body');

    if (!login || login.length < 3 || !role || !roles.role) {
      // next(ApiError.badRequest('Заполните данные'));
    }

    next();
  } catch (e) {
    res.status(401).json({ message: 'Ошибка валидации' });
  }
};
