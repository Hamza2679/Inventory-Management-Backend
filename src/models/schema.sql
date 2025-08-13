-- PostgreSQL schema for Inventory Management System

CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(150) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL,
	role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff')),
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
	id SERIAL PRIMARY KEY,
	name VARCHAR(150) NOT NULL,
	category VARCHAR(100),
	description TEXT,
	sku VARCHAR(100) UNIQUE,
	unit VARCHAR(50),
	price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
	image_url TEXT,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock (
	id SERIAL PRIMARY KEY,
	product_id INT REFERENCES products(id) ON DELETE CASCADE,
	quantity INT NOT NULL CHECK (quantity >= 0),
	location VARCHAR(150),
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_product_id ON stock(product_id);

CREATE TABLE IF NOT EXISTS suppliers (
	id SERIAL PRIMARY KEY,
	name VARCHAR(150) NOT NULL,
	phone VARCHAR(50),
	email VARCHAR(150),
	address TEXT,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
	id SERIAL PRIMARY KEY,
	product_id INT REFERENCES products(id) ON DELETE SET NULL,
	quantity INT NOT NULL CHECK (quantity > 0),
	sale_price NUMERIC(12,2) NOT NULL CHECK (sale_price >= 0),
	customer_name VARCHAR(150),
	customer_contact VARCHAR(150),
	sale_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);

CREATE TABLE IF NOT EXISTS activity_logs (
	id SERIAL PRIMARY KEY,
	user_id INT REFERENCES users(id) ON DELETE SET NULL,
	action VARCHAR(50) NOT NULL,
	table_name VARCHAR(50) NOT NULL,
	ref_id INT,
	timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers to update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users
	FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON products
	FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS set_stock_updated_at ON stock;
CREATE TRIGGER set_stock_updated_at BEFORE UPDATE ON stock
	FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS set_suppliers_updated_at ON suppliers;
CREATE TRIGGER set_suppliers_updated_at BEFORE UPDATE ON suppliers
	FOR EACH ROW EXECUTE PROCEDURE set_updated_at();


