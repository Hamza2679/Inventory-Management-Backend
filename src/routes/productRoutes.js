const router = require('express').Router();
const upload = require('../middleware/uploadMiddleware');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
	createProduct,
	createValidators,
	updateProduct,
	updateValidators,
	getProducts,
	getProductById,
	deleteProduct
} = require('../controllers/productController');

router.get('/', authenticate, getProducts);
router.get('/:id', authenticate, getProductById);
router.post('/', authenticate, authorize('admin', 'staff'), upload.single('image'), createValidators, createProduct);
router.put('/:id', authenticate, authorize('admin', 'staff'), upload.single('image'), updateValidators, updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

module.exports = router;


