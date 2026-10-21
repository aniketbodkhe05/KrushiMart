-- Optional supplementary demo listings for local PostgreSQL use.
-- The canonical demo data is backend/src/main/resources/db/seed/V2__dev_seed.sql,
-- which Flyway loads only with the dev Spring profile.
-- This script is idempotent and depends on the six demo users already existing.

INSERT INTO products
    (seller_id, title, description, category, price, currency, quantity_available,
     unit, listing_status, language, region, image_url, created_at, updated_at)
SELECT
    u.id,
    'Paddy Seeds CR-100',
    'Certified CR-100 paddy seed from the current season. Sold in sealed 10kg bags; germination details available at pickup.',
    'SEEDS',
    1250.00,
    'INR',
    30,
    'BAG',
    'ACTIVE',
    'en',
    'Pune',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u
WHERE u.phone = '9876543211'
  AND NOT EXISTS (
      SELECT 1 FROM products p
      WHERE p.seller_id = u.id AND p.title = 'Paddy Seeds CR-100'
  );

INSERT INTO products
    (seller_id, title, description, category, price, currency, quantity_available,
     unit, listing_status, language, region, image_url, created_at, updated_at)
SELECT
    u.id,
    'Solar Water Pump 2HP',
    'Two-horsepower solar pump with controller. Suitable for a small farm well; demonstration available before purchase.',
    'IRRIGATION',
    52000.00,
    'INR',
    1,
    'PIECE',
    'ACTIVE',
    'en',
    'Nagpur',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u
WHERE u.phone = '9876543212'
  AND NOT EXISTS (
      SELECT 1 FROM products p
      WHERE p.seller_id = u.id AND p.title = 'Solar Water Pump 2HP'
  );
