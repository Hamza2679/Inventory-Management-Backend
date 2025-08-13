const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/errorMiddleware');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const stockRoutes = require('./routes/stockRoutes');
const salesRoutes = require('./routes/salesRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Global middlewares
app.use(helmet());
app.use(compression());
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Basic healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Ensure uploads directory exists and serve static files
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Swagger Docs
const openapiPath = path.join(process.cwd(), 'src', 'docs', 'openapi.yaml');
const openapiDocument = YAML.load(openapiPath);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Rate limiter for auth sensitive routes
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/auth', authLimiter, authRoutes);

// API routes
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// 404 and Error handlers
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;


