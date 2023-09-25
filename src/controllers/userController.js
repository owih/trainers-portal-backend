const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const dotenv = require('dotenv');
const {rolesToRegistration, roles, rolesToCreate} = require("../assets/roleRules");

dotenv.config();

const generateJwt = ({ id, email, role }) => {
  return jwt.sign(
    { id, email, role },
    process.env.SECRET_KEY || 'secret',
    { expiresIn: '62h' }
  );
};

class UserController {
  async registration(req, res, next) {
    try {
      const {
        login,
        password,
        role,
        name,
        surname,
      } = req.body;

      console.log(req.body, 'req.body registration');

      if (!login || !password) {
        return next(ApiError.badRequest('Заполните логин и пароль'));
      }

      if (!rolesToRegistration.includes(role)) {
        return next(ApiError.badRequest('Недоступная роль для регистрации'));
      }

      const userWithRequestLogin = await prisma.user.findFirst({
        where: { login },
      });

      if (userWithRequestLogin) {
        return next(ApiError.badRequest('Данный логин уже занят'));
      }

      const hashPassword = await bcrypt.hash(password, 3);

      const user = await prisma.user.create({
        data: {
          login,
          password: hashPassword,
          role,
        },
      });

      if (role === roles.ATHLETE) {
        const athlete = await prisma.athlete.create({
          data: {
            user_id: user.id,
            name,
            surname,
          }
        });
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            athlete,
          }
        });
      }

      if (role === roles.PARENT) {
        const parent = await prisma.parent.create({
          data: {
            user_id: user.id,
            name,
            surname,
          }
        });
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            parent,
          }
        });
      }

      return res.status(200);
    } catch (e) {
      console.log('catch');
      return next(ApiError.internal('Ошибка регистрации'));
    }
  }

  async login(req, res, next) {
    console.log(req.body);
    try {
      const { login, password } = req.body;

      const user = await prisma.user.findFirst({
        where: { login },
      });

      if (!user) {
        return next(ApiError.badRequest('Пользователь не найден'));
      }

      const comparePassword = bcrypt.compareSync(password, user.password);

      if (!comparePassword) {
        return next(ApiError.internal('Неверный пароль'));
      }

      const token = generateJwt({
        id: user.id,
        login: user.login,
        role: user.role,
      });

      return res.status(200).json({ token });
    } catch (e) {
      return next(ApiError.internal('Ошибка авторизации'));
    }
  }

  async check(req, res, next) {
    try {
      const { user } = req.body;

      const token = generateJwt({
        id: user.id,
        login: user.login,
        role: user.role,
      });

      return res.status(200).json({ token });
    } catch (e) {
      return next(ApiError.internal('Ошибка'));
    }
  }

  async create(req, res, next) {
    try {
      let allowedRolesToCreate = [roles.ATHLETE, roles.PARENT];

      if ([roles.ADMIN, roles.MODERATOR].includes(req.body.user.role)) {
        allowedRolesToCreate.push(roles.TRAINER);
      }

      if (req.body.user.role === roles.ADMIN) {
        allowedRolesToCreate.push(roles.MODERATOR);
      }

      const {
        login,
        password,
        role,
        name,
        surname,
      } = req.body;

      if (!allowedRolesToCreate.includes(role)) {
        return next(ApiError.badRequest('Недостаточно прав для создания роли ' + role));
      }

      if (!login || !password || !role || !name || !surname) {
        return next(ApiError.badRequest('Заполните все данные для создания аккаунта'));
      }

      if (!rolesToCreate.includes(role)) {
        return next(ApiError.badRequest('Недоступная роль для регистрации'));
      }

      const userWithRequestLogin = await prisma.user.findFirst({
        where: { login },
      });

      if (userWithRequestLogin) {
        return next(ApiError.badRequest('Данный логин уже занят'));
      }

      const hashPassword = await bcrypt.hash(password, 3);

      const user = await prisma.user.create({
        data: {
          login,
          password: hashPassword,
          role,
        },
      });

      if (role === roles.ATHLETE) {
        const athlete = await prisma.athlete.create({
          data: {
            user_id: user.id,
            name,
            surname,
          }
        });
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            athlete,
          }
        });
      }

      if (role === roles.PARENT) {
        const parent = await prisma.parent.create({
          data: {
            user_id: user.id,
            name,
            surname,
          }
        });
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            parent,
          }
        });
      }

      if (role === roles.TRAINER) {
        const trainer = await prisma.trainer.create({
          data: {
            user_id: user.id,
            name,
            surname,
          }
        });
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            trainer,
          }
        });
      }

      return res.status(200);
    } catch (e) {
      console.log('catch');
      return next(ApiError.internal('Ошибка регистрации'));
    }
  }

  async update(req, res, next) {
    try {
      const {
        id,
        login,
        password,
        role,
        name,
        surname,
      } = req.body;

      console.log(req.body, 'req.body registration');

      if (!login || !password) {
        return next(ApiError.badRequest('Заполните логин и пароль'));
      }

      if (!rolesToCreate.includes(role)) {
        return next(ApiError.badRequest('Недоступная роль для регистрации'));
      }

      const userWithRequestLogin = await prisma.user.findFirst({
        where: { login },
      });

      if (userWithRequestLogin) {
        return next(ApiError.badRequest('Данный логин уже занят'));
      }

      const hashPassword = await bcrypt.hash(password, 3);

      const user = await prisma.user.create({
        data: {
          login,
          password: hashPassword,
          role,
        },
      });

      if (role === roles.ATHLETE) {
        const athlete = await prisma.athlete.create({
          data: {
            user_id: user.id,
            name,
            surname,
          }
        });
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            athlete,
          }
        });
      }

      if (role === roles.PARENT) {
        const parent = await prisma.parent.create({
          data: {
            user_id: user.id,
            name,
            surname,
          }
        });
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            parent,
          }
        });
      }

      if (role === roles.TRAINER) {
        const trainer = await prisma.trainer.create({
          data: {
            user_id: user.id,
            name,
            surname,
          }
        });
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            trainer,
          }
        });
      }

      const token = generateJwt({
        id: user.id,
        login: user.login,
        role: user.role,
      });

      return res.status(200);
    } catch (e) {
      console.log('catch');
      return next(ApiError.internal('Ошибка регистрации'));
    }
  }
}

module.exports = new UserController();
