const db = require('../db');
const bcrypt = require('bcrypt');
const path = require('path');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users WHERE role = "user"');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users' });
  }
};


// Get user by ID
exports.getUserById = (req, res) => {
  const { id } = req.params;
  console.log("Fetching user ID:", id); 

  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: 'Error fetching user' });
    }

    console.log("User result:", results); // <- debug

    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    return res.json(results[0]);
  });
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, photo_profile FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = rows[0];
    user.photo_profile = user.photo_profile
      ? `${req.protocol}://${req.get('host')}/${user.photo_profile.replace(/\\/g, '/')}`
      : null;

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Update user by ID
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    await db.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );

    const [rows] = await db.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating user' });
  }
};


// Delete user by ID
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting user' });
    res.json({ message: 'User deleted successfully' });
  });
};

// Update password
exports.updatePassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({ message: 'Password berhasil diperbarui' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ message: 'Gagal memperbarui password' });
  }
};



// Upload profile photo
exports.uploadProfilePhoto = async (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const filePath = path.join('assets', req.file.filename);
  const fullUrl = `${req.protocol}://${req.get('host')}/${filePath.replace(/\\/g, '/')}`;

  try {
    await db.query(
      'UPDATE users SET photo_profile = ? WHERE id = ?',
      [filePath, id]
    );

    res.json({
      message: 'Foto profil berhasil diunggah',
      photo_profile: fullUrl, 
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Gagal upload foto' });
  }
};
