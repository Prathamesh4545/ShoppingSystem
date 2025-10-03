-- Performance Optimization Indexes for ShoppingSystem Database
-- Run this script after initial database setup for production environments

-- Product table indexes
CREATE INDEX IF NOT EXISTS idx_product_name ON product(product_name);
CREATE INDEX IF NOT EXISTS idx_product_category ON product(category);
CREATE INDEX IF NOT EXISTS idx_product_brand ON product(brand);
CREATE INDEX IF NOT EXISTS idx_product_available ON product(available);
CREATE INDEX IF NOT EXISTS idx_product_release_date ON product(release_date);
CREATE INDEX IF NOT EXISTS idx_product_price ON product(price);

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(user_name);
CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role);

-- Cart table indexes
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);

-- Cart Item table indexes
CREATE INDEX IF NOT EXISTS idx_cart_item_cart_id ON cart_item(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_item_product_id ON cart_item(product_id);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);

-- Order Item table indexes
CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON order_item(order_id);
CREATE INDEX IF NOT EXISTS idx_order_item_product_id ON order_item(product_id);

-- Deals table indexes
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(active);
CREATE INDEX IF NOT EXISTS idx_deals_start_date ON deals(start_date);
CREATE INDEX IF NOT EXISTS idx_deals_end_date ON deals(end_date);

-- Address table indexes
CREATE INDEX IF NOT EXISTS idx_address_user_id ON address(user_id);

-- Product Image table indexes
CREATE INDEX IF NOT EXISTS idx_product_image_product_id ON product_image(product_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_product_category_available ON product(category, available);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
