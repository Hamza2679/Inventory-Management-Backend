require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

async function run() {
	try {
		const schemaPath = path.join(process.cwd(), 'src', 'models', 'schema.sql');
		const sql = fs.readFileSync(schemaPath, 'utf-8');
		await db.query(sql);
		console.log('Migrations executed successfully.');
		process.exit(0);
	} catch (err) {
		console.error('Migration error:', err);
		process.exit(1);
	}
}

run();


