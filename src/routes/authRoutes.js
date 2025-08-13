const router = require('express').Router();
const { register, login, registerValidators, loginValidators } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

router.post('/register', registerValidators, register);
router.post('/login', loginValidators, login);

// Example endpoint to test RBAC
router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

module.exports = router;


