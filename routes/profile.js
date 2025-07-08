const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');

const db = require('../db');

router.use(authenticateToken);

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [user] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);

    if (!user || user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
