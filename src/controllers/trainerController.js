const ApiError = require('../error/ApiError');
const prisma = require('../prisma');

class TrainerController {
  async get(req, res, next) {
    try {
      const { id } = req.body;

      if (!Number(id)) {
        return next(ApiError.badRequest('Ошибка идентификатора'));
      }

      const trainer = await prisma.trainer.findUnique({
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({ role: trainer });
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
        date_of_birth,
        home_address,
        phone_number,
      } = req.body;

      const updatedTrainer = await prisma.trainer.update({
        where: {
          id,
        },
        data: {
          name,
          surname,
          patronymic,
          date_of_birth,
          home_address,
          phone_number,
        },
      });

      return res.status(200).json({ role: updatedTrainer });
    } catch (e) {
      return next(ApiError.internal('Ошибка при обновлении данных'));
    }
  }
}

module.exports = new TrainerController();
