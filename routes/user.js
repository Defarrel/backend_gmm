const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/uploadMiddleware');
const { authenticateToken } = require('../middlewares/authMiddleware');
router.use(authenticateToken);

router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.get('/me', userController.getCurrentUser);
router.put('/users/:id/password', userController.updatePassword);
router.put('/users/:id/photo', upload.single('photo'), userController.uploadProfilePhoto);


module.exports = router;
