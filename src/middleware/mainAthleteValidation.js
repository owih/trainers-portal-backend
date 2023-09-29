const ApiError = require("../error/ApiError");
module.exports = (req, res, next) => {
  try {
    const {
      id,
      name,
      surname,
      date_of_birth,
    } = req.body;

    if (
      !date_of_birth
      || !Number(id)
      || !name || name.length < 2
      || !surname || surname.length < 2
    ) {
      next(ApiError.badRequest('Заполните данные'));
    }

    next();
  } catch (e) {
    res.status(401).json({ message: 'Ошибка валидации' });
  }
};
