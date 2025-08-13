const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'uploads')),
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
	}
});

const fileFilter = (req, file, cb) => {
	if (/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) return cb(null, true);
	return cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

module.exports = upload;


