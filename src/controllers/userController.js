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

const getAllowedRoles = (role) => {
  let allowedRolesToCreate = [roles.ATHLETE, roles.PARENT];

  if ([roles.ADMIN, roles.MODERATOR].includes(role)) {
    allowedRolesToCreate.push(roles.TRAINER);
  }

  if (role === roles.ADMIN) {
    allowedRolesToCreate.push(roles.MODERATOR);
  }

  return allowedRolesToCreate;
};

class UserController {
  async registration(req, res, next) {
    try {
      const {
        login,
        password,
        role,
      } = req.body;

      console.log(req.body, 'req.body registration');

      if (!password || password.length < 4) {
        return next(ApiError.badRequest('Длина пароля должна быть больше 4'));
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
      const allowedRolesToCreate = getAllowedRoles(req.user.role);
      const {
        login,
        password,
        role,
      } = req.body;

      if (!allowedRolesToCreate.includes(role)) {
        return next(ApiError.badRequest('Недостаточно прав для создания роли ' + role));
      }

      if (!password || password.length < 4) {
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

      const formattedRoleToCreate = role.toLowerCase();

      await prisma[formattedRoleToCreate].create({
        data: {
          user_id: user.id,
        }
      });

      return res.status(200);
    } catch (e) {
      console.log('catch');
      return next(ApiError.internal('Ошибка регистрации'));
    }
  }

  async update(req, res, next) {
    try {
      const allowedRolesToCreate = getAllowedRoles(req.user.role);
      const {
        id,
        login,
        password,
        role,
      } = req.body;


      if (!allowedRolesToCreate.includes(role)) {
        return next(ApiError.badRequest('Недостаточно прав для редактирования роли ' + role));
      }

      if (password && password.length < 4) {
        return next(ApiError.badRequest('Длина пароля должна быть больше 4'));
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return next(ApiError.badRequest('Пользователь не найдет'));
      }

      let hashPassword = '';
      if (password) {
        hashPassword = await bcrypt.hash(password, 3);
      }

      const updatedUser = await prisma.user.update({
        where: {
          id,
        },
        data: {
          login,
          password: hashPassword ? hashPassword : user.password,
          role,
        },
      });

      if (user.role === role) {
        return;
      }

      const formattedRoleToUpdate = role.toLowerCase();
      const formattedRoleToDelete = user.role.toLowerCase();

      await prisma[formattedRoleToDelete].delete({
        where: {
          user_id: user.id,
        }
      });

      await prisma[formattedRoleToUpdate].create({
        data: {
          user_id: user.id,
        }
      });

      return res.status(200);
    } catch (e) {
      console.log('catch');
      return next(ApiError.internal('Ошибка обновления данных пользователя'));
    }
  }
}

module.exports = new UserController();
