const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
	if (!token) return res.status(401).json({ message: 'No token provided' });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
};

const authorize = (...roles) => (req, res, next) => {
	if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
	if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
	return next();
};

module.exports = { authenticate, authorize };


