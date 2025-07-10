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
    // Ambil data utama saving
    const [savingResult] = await db.query(`
      SELECT s.*, u.name AS owner_name
      FROM savings s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [id]);

    if (savingResult.length === 0) {
      return res.status(404).json({ message: 'Tabungan tidak ditemukan' });
    }

    const saving = savingResult[0];

    // Ambil anggota tabungan
    const [members] = await db.query(`
      SELECT u.id, u.name, sp.amount
      FROM savings_participants sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.saving_id = ?
    `, [id]);

    // Gabungkan response
    saving.members = members;

    res.json(saving);
  } catch (err) {
    console.error(err);
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

    // Tambahkan transaksi
    await db.query(`
      INSERT INTO transactions (user_id, type, category, amount, description, date)
      VALUES (?, 'pemasukan', 'Top Up Tabungan Bersama', ?, 'Top Up Tabungan Bersama', NOW())
    `, [user_id, amount]);

    res.json({ message: 'Berhasil menabung ke tabungan bersama' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menyimpan kontribusi' });
  }
};

// Withdraw: Tarik dari tabungan bersama
exports.withdrawFromSaving = async (req, res) => {
  const { id } = req.params;
  const { user_id, amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Jumlah tidak valid' });
  }

  try {
    const [savingRows] = await db.query(`SELECT * FROM savings WHERE id = ?`, [id]);
    if (savingRows.length === 0) {
      return res.status(404).json({ message: 'Tabungan tidak ditemukan' });
    }

    const saving = savingRows[0];

    if (saving.current_amount < amount) {
      return res.status(400).json({ message: 'Saldo tabungan tidak mencukupi' });
    }

    // Kurangi saldo
    await db.query(`
      UPDATE savings
      SET current_amount = current_amount - ?
      WHERE id = ?
    `, [amount, id]);

    // Catat sebagai transaksi pengeluaran
    await db.query(`
      INSERT INTO transactions (user_id, type, category, amount, description, date)
      VALUES (?, 'pengeluaran', 'Tarik Tabungan Bersama', ?, 'Penarikan dari tabungan bersama', NOW())
    `, [user_id, amount]);

    res.json({ message: 'Penarikan berhasil' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menarik dana' });
  }
};


// List transaksi (riwayat kontribusi)
exports.getSavingContributions = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        sp.amount,
        sp.created_at AS date,
        u.name AS user_name,
        s.title AS saving_title
      FROM savings_participants sp
      JOIN users u ON sp.user_id = u.id
      JOIN savings s ON s.id = sp.saving_id
      WHERE sp.saving_id = ?
      ORDER BY sp.created_at DESC
    `, [id]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil riwayat kontribusi' });
  }
};

