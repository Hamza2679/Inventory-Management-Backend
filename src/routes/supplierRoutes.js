const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { createSupplier, createValidators, updateSupplier, updateValidators, listSuppliers, deleteSupplier } = require('../controllers/supplierController');

router.get('/', authenticate, listSuppliers);
router.post('/', authenticate, authorize('admin', 'staff'), createValidators, createSupplier);
router.put('/:id', authenticate, authorize('admin', 'staff'), updateValidators, updateSupplier);
router.delete('/:id', authenticate, authorize('admin'), deleteSupplier);

module.exports = router;


