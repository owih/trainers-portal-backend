const ApiError = require('../error/ApiError');
const prisma = require('../prisma');

class ParentController {
  async get(req, res, next) {
    try {
      const { id } = req.body;

      if (!Number(id)) {
        return next(ApiError.badRequest('Ошибка идентификатора'));
      }

      const parent = await prisma.parent.findUnique({
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({ role: parent });
    } catch (e) {
      return next(ApiError.internal('Ошибка при получении профиля'));
    }
  }

  async update(req, res, next) {
    try {
      const {
        id,
        name,
        surname,
        patronymic,
        workplace,
        relation,
        relation_description,
        phone_number,
      } = req.body;

      const updatedParent = await prisma.parent.update({
        where: {
          id,
        },
        data: {
          name,
          surname,
          patronymic,
          relation,
          relation_description,
          workplace,
          phone_number,
        },
      });

      return res.status(200).json({ role: updatedParent });
    } catch (e) {
      return next(ApiError.internal('Ошибка при обновлении данных'));
    }
  }
}

module.exports = new ParentController();
