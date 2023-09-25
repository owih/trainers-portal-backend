const jwt = require('jsonwebtoken');

module.exports = (role) => {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') {
      next();
    }
    try {
      const token = req.headers?.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY || 'secret',
      );

      if (decoded.role !== role) {
        return res.status(401).json({ message: 'No access' });
      }

      req.body.user = decoded;
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  };
};
