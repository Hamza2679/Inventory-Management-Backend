const db = require('../config/db');

async function logActivity(userId, action, tableName, refId) {
	await db.query(
		'INSERT INTO activity_logs (user_id, action, table_name, ref_id) VALUES ($1, $2, $3, $4)',
		[userId || null, action, tableName, refId || null]
	);
}

module.exports = { logActivity };


