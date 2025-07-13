const db = require('../db');

// 1. Advisor mengirim request akses ke user
exports.requestAccess = async (req, res) => {
  const advisor_id = req.user.id;
  const { user_id } = req.body;

  if (req.user.role !== 'advisor') {
    return res.status(403).json({ message: 'Only advisors can request access' });
  }

  try {
    await db.query(
      `INSERT INTO advisor_requests (advisor_id, user_id, status, created_at, updated_at)
       VALUES (?, ?, 'PENDING', NOW(), NOW())
       ON DUPLICATE KEY UPDATE status = 'PENDING', updated_at = NOW()`,
      [advisor_id, user_id]
    );
    res.json({ message: 'Request sent', status: 'PENDING' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending request' });
  }
};

// 2. Advisor melihat semua request miliknya
exports.listRequestsByAdvisor = async (req, res) => {
  const advisor_id = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT ar.id, ar.user_id, ar.status, ar.feedback, ar.created_at, ar.updated_at,
              u.name, u.email
       FROM advisor_requests ar
       JOIN users u ON u.id = ar.user_id
       WHERE ar.advisor_id = ?`,
      [advisor_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching advisor requests' });
  }
};

// 3. User melihat semua permintaan yang masuk dari advisor
exports.listIncomingRequests = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT ar.id, ar.advisor_id, ar.status, ar.feedback, ar.created_at, ar.updated_at,
              a.name AS advisor_name, a.email AS advisor_email
       FROM advisor_requests ar
       JOIN users a ON a.id = ar.advisor_id
       WHERE ar.user_id = ?`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching incoming requests' });
  }
};

// 4. User menerima atau menolak request
exports.updateRequest = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['ACCEPTED', 'DECLINED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const [result] = await db.query(
      `UPDATE advisor_requests
       SET status = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Status updated', status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating status' });
  }
};

// 5. Advisor mengirim feedback jika request telah di-accept
exports.sendFeedback = async (req, res) => {
  const advisor_id = req.user.id;
  const { id } = req.params;
  const { feedback } = req.body;

  if (!feedback || feedback.trim() === "") {
    return res.status(400).json({ message: 'Feedback tidak boleh kosong' });
  }

  try {
    const [result] = await db.query(
      `UPDATE advisor_requests
       SET feedback = ?, updated_at = NOW()
       WHERE id = ? AND advisor_id = ? AND status = 'ACCEPTED'`,
      [feedback, id, advisor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Request tidak ditemukan atau belum di-accept' });
    }

    res.json({ message: 'Feedback berhasil dikirim' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengirim feedback' });
  }
};
