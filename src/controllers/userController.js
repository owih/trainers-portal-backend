const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const dotenv = require('dotenv');
const {roles, rolesToCreate, rolesWithProfiles} = require("../assets/roleRules");

dotenv.config();

const generateJwt = ({ id, login, role, is_disabled }) => {
  return jwt.sign(
    { id, login, role, is_disabled },
    process.env.SECRET_KEY || 'secret',
    { expiresIn: '62h' }
  );
};

const getAllowedRoles = (role) => {
  let allowedRolesToCreate = [];

  if ([roles.ADMIN, roles.MODERATOR].includes(role)) {
    allowedRolesToCreate.push(roles.TRAINER);
  }

  if (role === roles.ADMIN) {
    allowedRolesToCreate.push(roles.ADMIN, roles.MODERATOR);
  }

  return allowedRolesToCreate;
};

const getUserToResponse = (user) => {
  return {
    id: user.id,
    login: user.login,
    role: user.role,
    is_disabled: user.is_disabled,
  };
};

class UserController {
  async getWithRoleInfo(req, res, next) {
    try {
      const { id } = req.params;

      if (!Number(id)) {
        return next(ApiError.badRequest('Ошибка идентификатора'));
      }

      const user = await prisma.user.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          trainer: true,
        }
      });

      if (!user) {
        return next(ApiError.badRequest('Пользователь не найден'));
      }

      console.log(user, 'user');

      const userToResponse = getUserToResponse(user);
      const formattedUserRole = user.role.toLowerCase();

      if (!rolesWithProfiles.includes(user.role)) {
        return res.status(200).json({ user: userToResponse, role: null });
      }

      const role = await prisma[formattedUserRole].findUnique({
        where: {
          user_id: user.id,
        }
      });

      return res.status(200).json({ user: userToResponse, role });
    } catch (e) {
      console.log(e, 'catch');
      return next(ApiError.internal('Ошибка обновления данных пользователя'));
    }
  }

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

      console.log(res, 'res');
      return res.status(200);
    } catch (e) {
      console.log('catch');
      return next(ApiError.internal('Ошибка регистрации'));
    }
  }

  async login(req, res, next) {
    console.log(req.body);
    try {
      const login = req.body.login.toLowerCase();
      const { password } = req.body;

      const user = await prisma.user.findUnique({
        where: { login },
      });

      console.log(user, 'user');

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
        is_disabled: user.is_disabled,
      });

      const userToResponse = getUserToResponse(user);

      return res.status(200).json({ user: userToResponse, token });
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
        is_disabled: user.is_disabled,
      });
      const userToResponse = getUserToResponse(user);

      return res.status(200).json({ user: userToResponse, token });
    } catch (e) {
      return next(ApiError.internal('Ошибка'));
    }
  }

  async create(req, res, next) {
    try {
      const allowedRolesToCreate = getAllowedRoles(req.body.user.role);
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

      const userToResponse = getUserToResponse(user);

      return res.status(200).json({ user: userToResponse });
    } catch (e) {
      console.log('catch');
      return next(ApiError.internal('Ошибка регистрации'));
    }
  }

  async update(req, res, next) {
    try {
      console.log(req.body, 'req.body');
      console.log(req.body.user, 'req.body.user');
      const allowedRolesToUpdate = getAllowedRoles(req.body.user.role);
      const login = req.body.login.toLowerCase();
      const {
        id,
        password,
        repeatPassword,
        role,
        is_disabled,
      } = req.body;
      console.log('after req body');

      if (!allowedRolesToUpdate.includes(role)) {
        return next(ApiError.badRequest('Недостаточно прав для редактирования роли ' + role));
      }

      console.log(id, 'id');
      console.log(Number(id), 'Number(id)');

      if (password && (password.length < 6 || password !== repeatPassword)) {
        return next(ApiError.badRequest('Длина пароля должна быть больше 6'));
      }

      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      console.log(user, 'update user');

      if (!user) {
        return next(ApiError.badRequest('Пользователь не найдет'));
      }

      let hashPassword = '';
      if (password) {
        hashPassword = await bcrypt.hash(password, 3);
      }

      const roleToUpdate = id === req.body.user.id ? req.body.user.role : role;
      const updateUserData = {
        login,
        password: hashPassword ? hashPassword : user.password,
        role: roleToUpdate,
        is_disabled,
      };

      if (user.role === roles.TRAINER && role !== roles.TRAINER) {
        updateUserData.trainer = null;
      }

      const updatedUser = await prisma.user.update({
        where: {
          id,
        },
        data: updateUserData,
      });

      console.log(updatedUser, 'updatedUser');

      const userToResponse = getUserToResponse(updatedUser);

      if (user.role === role || user.role === roles.ADMIN) {
        return res.status(200).json({ user: userToResponse, role: null });
      }

      const formattedRoleToUpdate = role.toLowerCase();
      const formattedRoleToDelete = user.role.toLowerCase();

      await prisma[formattedRoleToDelete].delete({
        where: {
          user_id: user.id,
        }
      });

      const updatedRole = await prisma[formattedRoleToUpdate].create({
        data: {
          user_id: user.id,
        }
      });


      return res.status(200).json({ user: userToResponse, role: updatedRole });
    } catch (e) {
      console.log(e, 'catch');
      return next(ApiError.internal('Ошибка обновления данных пользователя'));
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.body;


      if (!id) {
        return next(ApiError.badRequest('Неверный идентификатор пользователя'));
      }

      await prisma.user.delete({
        where: { id },
      });

      return res.status(200);
    } catch (e) {
      console.log('catch');
      return next(ApiError.internal('Ошибка удаления пользователя'));
    }
  }
}

module.exports = new UserController();
