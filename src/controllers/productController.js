const { body, param, validationResult } = require('express-validator');
const db = require('../config/db');
const { logActivity } = require('../services/activityService');

const createValidators = [
	body('name').isString().isLength({ min: 2 }),
	body('category').optional().isString(),
	body('description').optional().isString(),
	body('sku').optional().isString(),
	body('unit').optional().isString(),
	body('price').isFloat({ min: 0 }),
	body('image_url').optional().isString()
];

async function createProduct(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;
		const { name, category, description, sku, unit, price } = req.body;
		const result = await db.query(
			`INSERT INTO products (name, category, description, sku, unit, price, image_url)
			 VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
			[name, category || null, description || null, sku || null, unit || null, price, imageUrl]
		);
		await logActivity(req.user?.id, 'CREATE', 'products', result.rows[0].id);
		return res.status(201).json(result.rows[0]);
	} catch (err) { return next(err); }
}

const updateValidators = [
	param('id').isInt(),
	body('name').optional().isString(),
	body('category').optional().isString(),
	body('description').optional().isString(),
	body('sku').optional().isString(),
	body('unit').optional().isString(),
	body('price').optional().isFloat({ min: 0 }),
	body('image_url').optional().isString()
];

async function updateProduct(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;
		const id = Number(req.params.id);
		const fields = ['name','category','description','sku','unit','price'];
		const updates = [];
		const values = [];
		let idx = 1;
		for (const f of fields) {
			if (req.body[f] !== undefined) { updates.push(`${f}=$${idx++}`); values.push(req.body[f]); }
		}
		if (imageUrl) { updates.push(`image_url=$${idx++}`); values.push(imageUrl); }
		if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });
		values.push(id);
		const result = await db.query(`UPDATE products SET ${updates.join(', ')} WHERE id=$${idx} RETURNING *`, values);
		if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
		await logActivity(req.user?.id, 'UPDATE', 'products', id);
		return res.json(result.rows[0]);
	} catch (err) { return next(err); }
}

async function getProducts(req, res, next) {
	try {
		const result = await db.query('SELECT * FROM products ORDER BY id DESC');
		return res.json(result.rows);
	} catch (err) { return next(err); }
}

async function getProductById(req, res, next) {
	try {
		const id = Number(req.params.id);
		const result = await db.query('SELECT * FROM products WHERE id=$1', [id]);
		if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
		return res.json(result.rows[0]);
	} catch (err) { return next(err); }
}

async function deleteProduct(req, res, next) {
	try {
		const id = Number(req.params.id);
		const result = await db.query('DELETE FROM products WHERE id=$1 RETURNING id', [id]);
		if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
		await logActivity(req.user?.id, 'DELETE', 'products', id);
		return res.json({ message: 'Deleted' });
	} catch (err) { return next(err); }
}

module.exports = {
	createProduct,
	createValidators,
	updateProduct,
	updateValidators,
	getProducts,
	getProductById,
	deleteProduct
};


