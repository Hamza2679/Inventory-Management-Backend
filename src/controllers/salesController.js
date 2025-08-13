const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { logActivity } = require('../services/activityService');

const saleValidators = [
	body('product_id').isInt(),
	body('quantity').isInt({ min: 1 }),
	body('sale_price').isFloat({ min: 0 }),
	body('customer_name').optional().isString(),
	body('customer_contact').optional().isString()
];

async function recordSale(req, res, next) {
	const client = await db.getClient();
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) { client.release(); return res.status(400).json({ errors: errors.array() }); }
		const { product_id, quantity, sale_price, customer_name, customer_contact } = req.body;
		await client.query('BEGIN');
		const stockRes = await client.query('SELECT quantity FROM stock WHERE product_id=$1 FOR UPDATE', [product_id]);
		if (!stockRes.rows[0] || stockRes.rows[0].quantity < quantity) {
			await client.query('ROLLBACK');
			client.release();
			return res.status(400).json({ message: 'Insufficient stock' });
		}
		await client.query('UPDATE stock SET quantity = quantity - $1 WHERE product_id=$2', [quantity, product_id]);
		const saleRes = await client.query(
			'INSERT INTO sales (product_id, quantity, sale_price, customer_name, customer_contact) VALUES ($1,$2,$3,$4,$5) RETURNING *',
			[product_id, quantity, sale_price, customer_name || null, customer_contact || null]
		);
		await client.query('COMMIT');
		client.release();
		await logActivity(req.user?.id, 'CREATE', 'sales', saleRes.rows[0].id);
		return res.status(201).json(saleRes.rows[0]);
	} catch (err) {
		await client.query('ROLLBACK').catch(() => {});
		client.release();
		return next(err);
	}
}

async function listSales(req, res, next) {
	try {
		const result = await db.query('SELECT s.*, p.name as product_name FROM sales s LEFT JOIN products p ON s.product_id=p.id ORDER BY s.id DESC');
		return res.json(result.rows);
	} catch (err) { return next(err); }
}

module.exports = { saleValidators, recordSale, listSales };


