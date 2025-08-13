const db = require('../config/db');

async function lowStock(req, res, next) {
	try {
		const threshold = Number(req.query.threshold || 5);
		const result = await db.query(
			`SELECT p.id, p.name, COALESCE(s.quantity,0) as quantity
			 FROM products p
			 LEFT JOIN stock s ON s.product_id=p.id
			 WHERE COALESCE(s.quantity,0) <= $1
			 ORDER BY quantity ASC`,
			[threshold]
		);
		return res.json(result.rows);
	} catch (err) { return next(err); }
}

async function stockReport(req, res, next) {
	try {
		const result = await db.query(
			`SELECT p.id, p.name, COALESCE(s.quantity,0) as quantity, p.price
			 FROM products p LEFT JOIN stock s ON s.product_id=p.id
			 ORDER BY p.id DESC`
		);
		return res.json(result.rows);
	} catch (err) { return next(err); }
}

async function salesReport(req, res, next) {
	try {
		const { from, to } = req.query;
		const params = [];
		let where = '';
		if (from) { params.push(from); where += ` AND sale_date >= $${params.length}`; }
		if (to) { params.push(to); where += ` AND sale_date <= $${params.length}`; }
		const result = await db.query(
			`SELECT s.id, s.product_id, p.name as product_name, s.quantity, s.sale_price, s.sale_date,
			 (s.quantity * s.sale_price) as total_amount
			 FROM sales s LEFT JOIN products p ON s.product_id=p.id
			 WHERE 1=1 ${where}
			 ORDER BY s.sale_date DESC`,
			params
		);
		return res.json(result.rows);
	} catch (err) { return next(err); }
}

async function profitLoss(req, res, next) {
	try {
		const { from, to } = req.query;
		const params = [];
		let where = '';
		if (from) { params.push(from); where += ` AND sale_date >= $${params.length}`; }
		if (to) { params.push(to); where += ` AND sale_date <= $${params.length}`; }
		const result = await db.query(
			`SELECT SUM(s.quantity * s.sale_price) as revenue,
			 SUM(s.quantity * p.price) as cost,
			 (SUM(s.quantity * s.sale_price) - SUM(s.quantity * p.price)) as profit
			 FROM sales s LEFT JOIN products p ON s.product_id=p.id
			 WHERE 1=1 ${where}`,
			params
		);
		return res.json(result.rows[0] || { revenue: 0, cost: 0, profit: 0 });
	} catch (err) { return next(err); }
}

module.exports = { lowStock, stockReport, salesReport, profitLoss };


