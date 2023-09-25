const {roles} = require("../assets/roleRules");
const ApiError = require("../error/ApiError");
module.exports = (req, res, next) => {
  try {
    const {
      login,
      role,
      name,
      surname,
    } = req.body;

    if (!login || login.length < 3 || !role || !roles.includes(role) || !name || name.length < 3 || !surname || surname.length < 3) {
      next(ApiError.badRequest('Заполните данные'));
    }

    next();
  } catch (e) {
    res.status(401).json({ message: 'Ошибка валидации' });
  }
};
