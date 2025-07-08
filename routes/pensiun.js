const express = require('express');
const router = express.Router();
const pensionController = require('../controllers/pensiunController');
const { authenticateToken } = require('../middlewares/authMiddleware');
router.use(authenticateToken);

router.post('/add', pensionController.addPensionGoal);
router.get('/', pensionController.getPensionGoal);
router.post('/withdraw', pensionController.withdrawPension);
router.post('/topup', pensionController.topupPension);

module.exports = router;
