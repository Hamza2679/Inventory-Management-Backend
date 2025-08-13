const notFoundMiddleware = (req, res, next) => {
	res.status(404).json({ message: 'Route not found' });
};

const errorMiddleware = (err, req, res, next) => {
	console.error(err);
	const status = err.status || 500;
	const message = err.message || 'Internal Server Error';
	res.status(status).json({ message });
};

module.exports = { notFoundMiddleware, errorMiddleware };


