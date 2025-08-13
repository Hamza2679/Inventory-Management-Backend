const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { lowStock, stockReport, salesReport, profitLoss } = require('../controllers/reportController');

router.get('/low-stock', authenticate, lowStock);
router.get('/stock', authenticate, stockReport);
router.get('/sales', authenticate, salesReport);
router.get('/profit-loss', authenticate, profitLoss);

module.exports = router;


