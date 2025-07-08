const db = require('../db');

// Tambah dana pensiun
exports.addPensionGoal = async (req, res) => {
  const { target_amount, deadline } = req.body;

  if (!target_amount || !deadline) {
    return res.status(400).json({ message: 'Jumlah dan tanggal wajib diisi' });
  }

  try {
    // Cek jika sudah ada dana pensiun
    const [existing] = await db.query(
      `SELECT * FROM goals WHERE user_id = ? AND title = 'Dana Pensiun'`,
      [req.user.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Dana pensiun sudah pernah ditambahkan' });
    }

    // Tambahkan ke goals
    await db.query(
    `INSERT INTO goals (user_id, title, target_amount, current_amount, description, deadline) 
    VALUES (?, 'Dana Pensiun', ?, 0, ?, ?)`,
    [req.user.id, target_amount, 'Dana pensiun untuk masa pensiun', deadline]
    );


    // Tambahkan transaksi pemasukan
    await db.query(
      `INSERT INTO transactions (user_id, type, category, amount, description, date)
       VALUES (?, 'pemasukan', 'Dana Pensiun', ?, 'Setoran Dana Pensiun', NOW())`,
      [req.user.id, target_amount]
    );

    res.status(201).json({ message: 'Dana pensiun berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ambil detail dana pensiun
exports.getPensionGoal = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT * FROM goals WHERE user_id = ? AND title = 'Dana Pensiun' LIMIT 1`,
      [req.user.id]
    );

    if (data.length === 0) {
      return res.status(404).json({ message: 'Dana pensiun belum dibuat' });
    }

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tarik dana pensiun
exports.withdrawPension = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Jumlah tidak valid' });
  }

  try {
    const [rows] = await db.query(
      `SELECT * FROM goals WHERE user_id = ? AND title = 'Dana Pensiun' LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dana pensiun belum dibuat' });
    }

    const goal = rows[0];
    if (goal.current_amount < amount) {
      return res.status(400).json({ message: 'Saldo dana pensiun tidak mencukupi' });
    }

    const newAmount = goal.current_amount - amount;

    await db.query(
      `UPDATE goals SET current_amount = ? WHERE id = ?`,
      [newAmount, goal.id]
    );

    await db.query(
      `INSERT INTO transactions (user_id, type, category, amount, description, date)
       VALUES (?, 'pengeluaran', 'Tarik Dana Pensiun', ?, 'Penarikan dana pensiun', NOW())`,
      [req.user.id, amount]
    );

    res.json({ message: 'Dana pensiun berhasil ditarik', saldoBaru: newAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Topup Dana Pensiun
exports.topupPension = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Jumlah top up tidak valid' });
  }

  try {
    const [rows] = await db.query(
      `SELECT * FROM goals WHERE user_id = ? AND title = 'Dana Pensiun' LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dana pensiun belum dibuat' });
    }

    const goal = rows[0];

    // Pastikan angka diparsing sebagai integer
    const currentAmount = parseInt(goal.current_amount);
    const topupAmount = parseInt(amount);

    if (isNaN(currentAmount) || isNaN(topupAmount)) {
      return res.status(400).json({ message: 'Data jumlah tidak valid' });
    }

    const newAmount = currentAmount + topupAmount;

    await db.query(
      `UPDATE goals SET current_amount = ? WHERE id = ?`,
      [newAmount, goal.id]
    );

    await db.query(
      `INSERT INTO transactions (user_id, type, category, amount, description, date)
       VALUES (?, 'pemasukan', 'Top Up Dana Pensiun', ?, 'Top up dana pensiun', NOW())`,
      [req.user.id, topupAmount]
    );

    res.json({ message: 'Top up berhasil', saldoBaru: newAmount });
  } catch (err) {
    console.error('Top up error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

