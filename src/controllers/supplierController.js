const { body, param, validationResult } = require('express-validator');
const db = require('../config/db');
const { logActivity } = require('../services/activityService');

const createValidators = [
	body('name').isString().isLength({ min: 2 }),
	body('phone').optional().isString(),
	body('email').optional().isEmail().normalizeEmail(),
	body('address').optional().isString()
];

async function createSupplier(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { name, phone, email, address } = req.body;
		const result = await db.query('INSERT INTO suppliers (name, phone, email, address) VALUES ($1,$2,$3,$4) RETURNING *', [name, phone || null, email || null, address || null]);
		await logActivity(req.user?.id, 'CREATE', 'suppliers', result.rows[0].id);
		return res.status(201).json(result.rows[0]);
	} catch (err) { return next(err); }
}

const updateValidators = [
	param('id').isInt(),
	body('name').optional().isString(),
	body('phone').optional().isString(),
	body('email').optional().isEmail().normalizeEmail(),
	body('address').optional().isString()
];

async function updateSupplier(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const id = Number(req.params.id);
		const fields = ['name','phone','email','address'];
		const updates = [];
		const values = [];
		let idx = 1;
		for (const f of fields) {
			if (req.body[f] !== undefined) { updates.push(`${f}=$${idx++}`); values.push(req.body[f]); }
		}
		if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });
		values.push(id);
		const result = await db.query(`UPDATE suppliers SET ${updates.join(', ')} WHERE id=$${idx} RETURNING *`, values);
		if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
		await logActivity(req.user?.id, 'UPDATE', 'suppliers', id);
		return res.json(result.rows[0]);
	} catch (err) { return next(err); }
}

async function listSuppliers(req, res, next) {
	try {
		const result = await db.query('SELECT * FROM suppliers ORDER BY id DESC');
		return res.json(result.rows);
	} catch (err) { return next(err); }
}

async function deleteSupplier(req, res, next) {
	try {
		const id = Number(req.params.id);
		const result = await db.query('DELETE FROM suppliers WHERE id=$1 RETURNING id', [id]);
		if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
		await logActivity(req.user?.id, 'DELETE', 'suppliers', id);
		return res.json({ message: 'Deleted' });
	} catch (err) { return next(err); }
}

module.exports = { createSupplier, createValidators, updateSupplier, updateValidators, listSuppliers, deleteSupplier };


