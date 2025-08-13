const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');

const registerValidators = [
	body('name').isString().isLength({ min: 2 }),
	body('email').isEmail().normalizeEmail(),
	body('password').isLength({ min: 8 }),
	body('role').optional().isIn(['admin', 'staff'])
];

async function register(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { name, email, password, role = 'staff' } = req.body;
		const passwordHash = await bcrypt.hash(password, 10);
		const result = await db.query(
			'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, created_at',
			[name, email, passwordHash, role]
		);
		return res.status(201).json(result.rows[0]);
	} catch (err) {
		if (err.code === '23505') return res.status(409).json({ message: 'Email already in use' });
		return next(err);
	}
}

const loginValidators = [
	body('email').isEmail().normalizeEmail(),
	body('password').isString().isLength({ min: 8 })
];

async function login(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { email, password } = req.body;
		const userRes = await db.query('SELECT * FROM users WHERE email=$1', [email]);
		const user = userRes.rows[0];
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });
		const match = await bcrypt.compare(password, user.password);
		if (!match) return res.status(401).json({ message: 'Invalid credentials' });
		const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '12h' });
		return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
	} catch (err) {
		return next(err);
	}
}

module.exports = { register, login, registerValidators, loginValidators };


