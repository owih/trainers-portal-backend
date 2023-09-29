const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    next();
  }
  try {
    console.log('token');
    const token = req.headers?.authorization?.split(' ')[1];
    console.log(token);

    if (!token) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    req.body.user = jwt.verify(token, process.env.SECRET_KEY || 'secret');
    console.log(req.body.user);
    console.log('req');

    next();
  } catch (e) {
    res.status(401).json({ message: 'Не авторизован' });
  }
};
