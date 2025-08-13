const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { createUser, createValidators, updateUser, updateValidators, listUsers, deleteUser } = require('../controllers/userController');

router.get('/', authenticate, authorize('admin'), listUsers);
router.post('/', authenticate, authorize('admin'), createValidators, createUser);
router.put('/:id', authenticate, authorize('admin'), updateValidators, updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;


