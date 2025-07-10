const express = require('express');
const router = express.Router();
const controller = require('../controllers/invtController');
const { authenticateToken } = require('../middlewares/authMiddleware');
router.use(authenticateToken);

router.post('/invite', controller.sendInvitation);
router.get('/notifications/:userId', controller.getUserInvitations);
router.post('/respond', controller.respondToInvitation);

module.exports = router;