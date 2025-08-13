const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const shouldUseSSL = String(process.env.DATABASE_SSL || '').toLowerCase() === 'true'
	|| (connectionString ? /sslmode=require/i.test(connectionString) : false);

const pool = new Pool({
	connectionString,
	ssl: shouldUseSSL ? { rejectUnauthorized: false } : false,
	max: 10,
	idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
	console.error('Unexpected PG pool error', err);
});

module.exports = {
	query: (text, params) => pool.query(text, params),
	getClient: () => pool.connect(),
	pool
};


