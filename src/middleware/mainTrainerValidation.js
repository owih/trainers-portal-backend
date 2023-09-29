const ApiError = require("../error/ApiError");
module.exports = (req, res, next) => {
  try {
    const {
      id,
      name,
      surname,
      phone_number,
    } = req.body;

    if (!Number(id) || !name || name.length < 2 || !surname || surname.length < 2 || !phone_number) {
      next(ApiError.badRequest('Заполните данные'));
    }

    next();
  } catch (e) {
    res.status(401).json({ message: 'Ошибка валидации' });
  }
};
