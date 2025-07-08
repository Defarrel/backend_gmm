const db = require('../db');

// Get all users
exports.getAllUsers = (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching users' });
    res.json(results);
  });
};

// Get user by ID
exports.getUserById = (req, res) => {
  const { id } = req.params;
  console.log("Fetching user ID:", id); // <- debug

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


// Update user by ID
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  db.query(
    'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
    [name, email, role, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error updating user' });
      res.json({ message: 'User updated successfully' });
    }
  );
};

// Delete user by ID
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting user' });
    res.json({ message: 'User deleted successfully' });
  });
};
