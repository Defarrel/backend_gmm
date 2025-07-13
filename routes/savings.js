const express = require('express');
const router = express.Router();
const savingsController = require('../controllers/savingsController');
const { authenticateToken } = require('../middlewares/authMiddleware');
router.use(authenticateToken);

router.get('/', savingsController.getAllSavings);
router.get('/:id', savingsController.getSavingDetail);
router.post('/', savingsController.createSaving);
router.post('/:id/contribute', savingsController.contributeToSaving);
router.post('/:id/withdraw', savingsController.withdrawFromSaving);
router.get('/:id/contributions', savingsController.getSavingContributions);
router.get('/user/:userId', savingsController.getAllSavingsByUser);


module.exports = router;
