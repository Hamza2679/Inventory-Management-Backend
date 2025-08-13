require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
	console.log(`Inventory API listening on port ${PORT}`);
});

// Graceful shutdown & error handling for unhandled promise rejections
process.on('unhandledRejection', (reason) => {
	console.error('Unhandled Rejection:', reason);
	server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
	console.log('SIGTERM received. Shutting down gracefully.');
	server.close(() => process.exit(0));
});


