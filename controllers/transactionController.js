const db = require('../db');

// Ambil semua transaksi milik user login
exports.getTransactions = async (req, res) => {
  try {
    const [data] = await db.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
      [req.user.id]
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tambah transaksi baru
exports.addTransaction = async (req, res) => {
  const { type, category, amount, description, location, date } = req.body;


  if (!type || !amount || !date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await db.query(
      'INSERT INTO transactions (user_id, type, category, amount, description, location, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, type, category || '', amount, description || '', location || '', date]
    );
    res.status(201).json({ message: 'Transaction added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Hapus transaksi berdasarkan ID dan user
exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
