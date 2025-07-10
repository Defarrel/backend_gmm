const db = require('../db');

// Undangan
exports.sendInvitation = async (req, res) => {
  const { saving_id, sender_id, receiver_id } = req.body;
  try {
    await db.query(
      'INSERT INTO savings_invitations (saving_id, sender_id, receiver_id) VALUES (?, ?, ?)',
      [saving_id, sender_id, receiver_id]
    );
    res.status(201).json({ message: 'Undangan berhasil dikirim.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengirim undangan.', error: err });
  }
};

// Notifikasi
exports.getUserInvitations = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [results] = await db.query(
      `SELECT si.id, s.title AS saving_title, u.name AS sender_name, si.status, si.created_at
       FROM savings_invitations si
       JOIN savings s ON si.saving_id = s.id
       JOIN users u ON si.sender_id = u.id
       WHERE si.receiver_id = ?
       ORDER BY si.created_at DESC`,
      [userId]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil notifikasi.', error: err });
  }
};

// Proses undangan
exports.respondToInvitation = async (req, res) => {
  const { invitation_id, status } = req.body;
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid.' });
  }
  try {
    await db.query(
      'UPDATE savings_invitations SET status = ? WHERE id = ?',
      [status, invitation_id]
    );
    res.json({ message: `Undangan berhasil di-${status}.` });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memproses undangan.', error: err });
  }
};
