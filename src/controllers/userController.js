const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const dotenv = require('dotenv');

dotenv.config();

const generateJwt = ({ id, email, role, cartId, favoritesId }) => {
  return jwt.sign(
    { id, email, role, cartId, favoritesId },
    process.env.SECRET_KEY || 'secret',
    { expiresIn: '62h' }
  );
};

class UserController {
  async registration(req, res, next) {
    try {
      const { email, password } = req.body;

      console.log('registration');
      console.log(req.body);

      if (!email || !password) {
        return next(ApiError.badRequest('Incorrect email or password'));
      }

      const userWithRequestEmail = await prisma.user.findFirst({
        where: { email },
      });

      if (userWithRequestEmail) {
        return next(ApiError.badRequest('This email already exists'));
      }

      const hashPassword = await bcrypt.hash(password, 3);

      const cart = await prisma.cart.create({ data: {} });
      const favorites = await prisma.favorites.create({ data: {} });
      const user = await prisma.user.create({
        data: {
          email,
          password: hashPassword,
          cartId: cart.id,
          favoritesId: favorites.id,
        },
      });

      const token = generateJwt({
        id: user.id,
        email: user.email,
        role: user.role,
        cartId: user.cartId,
        favoritesId: user.favoritesId,
      });

      return res.status(200).json({ token });
    } catch (e) {
      console.log('catch');
      return next(ApiError.internal('Error while registration'));
    }
  }

  async login(req, res, next) {
    console.log(req.body);
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findFirst({
        where: { email },
      });

      if (!user) {
        return next(ApiError.badRequest('User not found'));
      }

      const comparePassword = bcrypt.compareSync(password, user.password);

      if (!comparePassword) {
        return next(ApiError.internal('Wrong password'));
      }

      const token = generateJwt({
        id: user.id,
        email: user.email,
        role: user.role,
        cartId: user.cartId,
        favoritesId: user.favoritesId,
      });

      return res.status(200).json({ token });
    } catch (e) {
      return next(ApiError.internal('Error while login'));
    }
  }

  async check(req, res, next) {
    try {
      const { user } = req.body;

      const token = generateJwt({
        id: user.id,
        email: user.email,
        role: user.role,
        cartId: user.cartId,
        favoritesId: user.favoritesId,
      });

      return res.status(200).json({ token });
    } catch (e) {
      return next(ApiError.internal('Error while check'));
    }
  }
}

module.exports = new UserController();
