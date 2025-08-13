const { body, param, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { logActivity } = require('../services/activityService');

const createValidators = [
	body('name').isString().isLength({ min: 2 }),
	body('email').isEmail().normalizeEmail(),
	body('password').isLength({ min: 8 }),
	body('role').isIn(['admin','staff'])
];

async function createUser(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { name, email, password, role } = req.body;
		const passwordHash = await bcrypt.hash(password, 10);
		const result = await db.query('INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, created_at', [name, email, passwordHash, role]);
		await logActivity(req.user?.id, 'CREATE', 'users', result.rows[0].id);
		return res.status(201).json(result.rows[0]);
	} catch (err) { if (err.code === '23505') return res.status(409).json({ message: 'Email already in use' }); return next(err); }
}

const updateValidators = [
	param('id').isInt(),
	body('name').optional().isString(),
	body('email').optional().isEmail().normalizeEmail(),
	body('password').optional().isLength({ min: 8 }),
	body('role').optional().isIn(['admin','staff'])
];

async function updateUser(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const id = Number(req.params.id);
		const fields = ['name','email','role'];
		const updates = [];
		const values = [];
		let idx = 1;
		for (const f of fields) {
			if (req.body[f] !== undefined) { updates.push(`${f}=$${idx++}`); values.push(req.body[f]); }
		}
		if (req.body.password) { updates.push(`password=$${idx++}`); values.push(await bcrypt.hash(req.body.password, 10)); }
		if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });
		values.push(id);
		const result = await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id=$${idx} RETURNING id, name, email, role, created_at, updated_at`, values);
		if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
		await logActivity(req.user?.id, 'UPDATE', 'users', id);
		return res.json(result.rows[0]);
	} catch (err) { return next(err); }
}

async function listUsers(req, res, next) {
	try {
		const result = await db.query('SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY id DESC');
		return res.json(result.rows);
	} catch (err) { return next(err); }
}

async function deleteUser(req, res, next) {
	try {
		const id = Number(req.params.id);
		const result = await db.query('DELETE FROM users WHERE id=$1 RETURNING id', [id]);
		if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
		await logActivity(req.user?.id, 'DELETE', 'users', id);
		return res.json({ message: 'Deleted' });
	} catch (err) { return next(err); }
}

module.exports = { createUser, createValidators, updateUser, updateValidators, listUsers, deleteUser };


