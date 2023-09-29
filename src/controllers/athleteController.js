const ApiError = require('../error/ApiError');
const prisma = require('../prisma');
const {roles} = require("../assets/roleRules");

class AthleteController {
  async get(req, res, next) {
    try {
      const { id } = req.body;

      if (!Number(id)) {
        return next(ApiError.badRequest('Неверный идентификатор'));
      }

      const athlete = await prisma.athlete.findUnique({
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({ role: athlete });
    } catch (e) {
      return next(ApiError.internal('Ошибка при получении профиля'));
    }
  }

  async getShortList(req, res, next) {
    try {
      const { name, surname, date_of_birth, limit, page } = req.query;
      const isScopedRequest = req.body.user.role === roles.TRAINER;

      const pageParsed = Number(page) || 1;
      const limitParsed = Number(limit) || 9;
      const offset = pageParsed * limitParsed - limitParsed;
      const filter = name || surname || date_of_birth;

      let athletes = [];
      let count = 0;

      const searchRequest = {};

      if (filter) {
        searchRequest.name = {
          contains: name,
        };
      }

      if (isScopedRequest) {
        const trainer = await prisma.trainer.findUnique({
          where: {
            user_id: req.body.user.id,
          }
        });
        searchRequest.trainer_id = trainer.id;
      }

      if (filter) {
        athletes = await prisma.athlete.findMany({
          skip: offset,
          take: limitParsed,
          where: searchRequest,
        });
        count = await prisma.athlete.count({
          where: searchRequest,
        });
      }

      return res.status(200).json({ roles: athletes, count, });
    } catch (e) {
      console.log('catch');
      return next(ApiError.internal('Ошибка обновления данных пользователя'));
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
        school_name,
        join_date,
        initial_fee,
        discount,
        additional_info,
        insurance_from_club,
        personal_insurance,
        medical_examination,
      } = req.body;

      const athlete = await prisma.athlete.findUnique({
        where: {
          id,
        }
      });

      console.log(athlete, 'athlete');

      const updatedAthlete = await prisma.athlete.update({
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
          school_name,
          join_date,
          initial_fee,
          discount,
          additional_info,
          insurance_from_club,
          personal_insurance,
          medical_examination,
        },
      });

      return res.status(200).json({ role: updatedAthlete });
    } catch (e) {
      return next(ApiError.internal('Ошибка при обновлении данных'));
    }
  }
}

module.exports = new AthleteController();
