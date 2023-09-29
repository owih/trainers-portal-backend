const jwt = require('jsonwebtoken');

module.exports = (roles) => {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') {
      next();
    }
    try {
      if (!roles.includes(req.body.user.role)) {
        return res.status(403).json({ message: 'Нет доступа' });
      }

      next();
    } catch (e) {
      return res.status(401).json({ message: 'Ошибка' });
    }
  };
};
