const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorRequestController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.post('/request', advisorController.requestAccess);
router.get('/advisor/requests', advisorController.listRequestsByAdvisor);
router.get('/user/requests', advisorController.listIncomingRequests);
router.put('/:id', advisorController.updateRequest);
router.put('/requests/:id/feedback', advisorController.sendFeedback);

module.exports = router;
