const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { addStock, addValidators, reduceStock, reduceValidators, getStock } = require('../controllers/stockController');

router.get('/', authenticate, getStock);
router.post('/add', authenticate, authorize('admin', 'staff'), addValidators, addStock);
router.post('/reduce', authenticate, authorize('admin', 'staff'), reduceValidators, reduceStock);

module.exports = router;


