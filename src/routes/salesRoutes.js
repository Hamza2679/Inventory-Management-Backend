const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { saleValidators, recordSale, listSales } = require('../controllers/salesController');

router.get('/', authenticate, listSales);
router.post('/', authenticate, authorize('admin', 'staff'), saleValidators, recordSale);

module.exports = router;


