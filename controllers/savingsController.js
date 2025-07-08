const db = require('../db');

// List: Ambil semua tabungan
exports.getAllSavings = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, u.name AS owner_name
      FROM savings s
      JOIN users u ON s.user_id = u.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data savings' });
  }
};

// Detail: Ambil detail tabungan tertentu + owner + anggota
exports.getSavingDetail = async (req, res) => {
  const { id } = req.params;
  try {
    // Ambil data utama tabungan
    const [savings] = await db.query(`
      SELECT s.*, u.name AS owner_name
      FROM savings s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [id]);

    if (savings.length === 0) {
      return res.status(404).json({ message: 'Tabungan tidak ditemukan' });
    }

    // Ambil semua anggota + kontribusi
    const [members] = await db.query(`
      SELECT sp.user_id AS id, u.name, SUM(sp.amount) AS amount
      FROM savings_participants sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.saving_id = ?
      GROUP BY sp.user_id
    `, [id]);

    const result = {
      ...savings[0],
      members: members
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail tabungan' });
  }
};



// Create: Tambah tabungan baru
exports.createSaving = async (req, res) => {
  const { user_id, title, target_amount, deadline } = req.body;
  try {
    await db.query(
      'INSERT INTO savings (user_id, title, target_amount, deadline) VALUES (?, ?, ?, ?)',
      [user_id, title, target_amount, deadline]
    );
    res.json({ message: 'Tabungan berhasil dibuat' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal membuat tabungan' });
  }
};

// Update: Top-up ke tabungan bersama
exports.contributeToSaving = async (req, res) => {
  const { id } = req.params;
  const { user_id, amount } = req.body;
  try {
    await db.query(`
      INSERT INTO savings_participants (saving_id, user_id, amount)
      VALUES (?, ?, ?)
    `, [id, user_id, amount]);

    await db.query(`
      UPDATE savings
      SET current_amount = current_amount + ?
      WHERE id = ?
    `, [amount, id]);

    res.json({ message: 'Berhasil menabung ke tabungan bersama' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menyimpan kontribusi' });
  }
};

// List transaksi (riwayat kontribusi)
exports.getSavingContributions = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT sp.*, u.name AS contributor_name
      FROM savings_participants sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.saving_id = ?
      ORDER BY sp.created_at DESC
    `, [id]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil riwayat kontribusi' });
  }
};
