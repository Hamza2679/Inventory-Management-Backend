const { body, param, validationResult } = require('express-validator');
const db = require('../config/db');
const { logActivity } = require('../services/activityService');

const addValidators = [
	body('product_id').isInt(),
	body('quantity').isInt({ min: 1 }),
	body('location').optional().isString()
];

async function addStock(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { product_id, quantity, location } = req.body;
		const existing = await db.query('SELECT * FROM stock WHERE product_id=$1', [product_id]);
		let result;
		if (existing.rows[0]) {
			result = await db.query(
				'UPDATE stock SET quantity = quantity + $1, location = COALESCE($2, location) WHERE product_id=$3 RETURNING *',
				[quantity, location || null, product_id]
			);
		} else {
			result = await db.query(
				'INSERT INTO stock (product_id, quantity, location) VALUES ($1,$2,$3) RETURNING *',
				[product_id, quantity, location || null]
			);
		}
		await logActivity(req.user?.id, 'STOCK_ADD', 'stock', result.rows[0].id);
		return res.status(201).json(result.rows[0]);
	} catch (err) { return next(err); }
}

const reduceValidators = [
	body('product_id').isInt(),
	body('quantity').isInt({ min: 1 })
];

async function reduceStock(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { product_id, quantity } = req.body;
		const result = await db.query('UPDATE stock SET quantity = quantity - $1 WHERE product_id=$2 AND quantity >= $1 RETURNING *', [quantity, product_id]);
		if (!result.rows[0]) return res.status(400).json({ message: 'Insufficient stock' });
		await logActivity(req.user?.id, 'STOCK_REDUCE', 'stock', result.rows[0].id);
		return res.json(result.rows[0]);
	} catch (err) { return next(err); }
}

async function getStock(req, res, next) {
	try {
		const result = await db.query('SELECT s.*, p.name as product_name FROM stock s JOIN products p ON s.product_id=p.id ORDER BY s.id DESC');
		return res.json(result.rows);
	} catch (err) { return next(err); }
}

module.exports = { addStock, addValidators, reduceStock, reduceValidators, getStock };


