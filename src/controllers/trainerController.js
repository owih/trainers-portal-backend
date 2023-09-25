const ApiError = require('../error/ApiError');
const prisma = require('../prisma');

class TrainerController {
  async get(req, res, next) {
    try {
      const { id } = req.body.user;

      if (!Number(id)) {
        return next(ApiError.badRequest('Ошибка!'));
      }

      const trainer = await prisma.trainer.findUnique({
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({ trainer });
    } catch (e) {
      return next(ApiError.internal('Error while get product'));
    }
  }

  async create(req, res, next) {
    try {
      const { productId } = req.body;
      const { cartId } = req.body.user;

      if (!cartId || !productId) {
        return next(ApiError.badRequest('Error while add product'));
      }

      await prisma.productOnCart.create({
        data: {
          cartId: Number(cartId),
          productId: Number(productId),
          assignedBy: '',
        },
      });

      const cart = await prisma.cart.findUnique({
        where: {
          id: cartId,
        },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      return res.status(200).json({ cart });
    } catch (e) {
      return next(ApiError.internal('Error while add product'));
    }
  }

  async delete(req, res, next) {
    try {
      const { productId } = req.body;
      const { cartId } = req.body.user;

      if (!cartId || !productId) {
        return next(ApiError.badRequest('Error while add product'));
      }

      await prisma.productOnCart.delete({
        where: {
          cartId_productId: {
            cartId,
            productId,
          },
        },
      });

      const cart = await prisma.cart.findUnique({
        where: {
          id: cartId,
        },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      return res.status(200).json({ cart });
    } catch (e) {
      return next(ApiError.internal('Error while product deleting'));
    }
  }

  async update(req, res, next) {
    try {
      const { productId, count } = req.body;
      const { cartId } = req.body.user;

      if (!cartId || !productId) {
        return next(ApiError.badRequest('Error while add product'));
      }

      await prisma.productOnCart.update({
        where: {
          cartId_productId: {
            cartId,
            productId,
          },
        },
        data: {
          count,
        },
      });

      const cart = await prisma.cart.findUnique({
        where: {
          id: cartId,
        },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      return res.status(200).json({ cart });
    } catch (e) {
      return next(ApiError.internal('Error while add product'));
    }
  }
}

module.exports = new TrainerController();
