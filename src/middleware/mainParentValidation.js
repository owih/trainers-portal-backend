const ApiError = require("../error/ApiError");
const {relationRules} = require("../assets/parentRules");

module.exports = (req, res, next) => {
  try {
    const {
      id,
      name,
      surname,
      relation,
      phone_number,
    } = req.body;

    if (
      !Number(id)
      || !name || name.length < 2
      || !surname || surname.length < 2
      || !relation || !relationRules[relation.toUpperCase()]
      || !phone_number || phone_number.length < 5
    ) {
      next(ApiError.badRequest('Заполните данные'));
    }

    next();
  } catch (e) {
    res.status(401).json({ message: 'Ошибка валидации' });
  }
};
