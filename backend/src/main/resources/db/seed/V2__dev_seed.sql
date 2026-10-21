-- Local/demo seed only. Enabled by the "dev" Spring profile.
-- Every demo account uses the literal password "password".
-- Never load this migration into a shared or public deployment.

INSERT INTO users (id, full_name, phone, password_hash, role, region, preferred_categories, notify_opt_in, contact_visible, created_at) VALUES
(1, 'Ramesh Patil', '9876543210', '$2b$10$W1lZEQKoFh6GlvDRTRu5Lev47oGLyAcJTqv0jzGeBD8Lik29eZj7S', 'FARMER', 'Nashik', 'MACHINERY,TOOLS,IRRIGATION', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '40 days'),
(2, 'Sunita Deshmukh', '9876543211', '$2b$10$W1lZEQKoFh6GlvDRTRu5Lev47oGLyAcJTqv0jzGeBD8Lik29eZj7S', 'FARMER', 'Pune', 'SEEDS,FERTILIZERS,PESTICIDES', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '38 days'),
(3, 'Vijay Jadhav', '9876543212', '$2b$10$W1lZEQKoFh6GlvDRTRu5Lev47oGLyAcJTqv0jzGeBD8Lik29eZj7S', 'FARMER', 'Nagpur', 'IRRIGATION,TOOLS', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '35 days'),
(4, 'Asha Kulkarni', '9876543213', '$2b$10$W1lZEQKoFh6GlvDRTRu5Lev47oGLyAcJTqv0jzGeBD8Lik29eZj7S', 'CUSTOMER', 'Nashik', NULL, TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '20 days'),
(5, 'Ganesh Pawar', '9876543214', '$2b$10$W1lZEQKoFh6GlvDRTRu5Lev47oGLyAcJTqv0jzGeBD8Lik29eZj7S', 'CUSTOMER', 'Nashik', NULL, TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '18 days'),
(6, 'Meera Shinde', '9876543215', '$2b$10$W1lZEQKoFh6GlvDRTRu5Lev47oGLyAcJTqv0jzGeBD8Lik29eZj7S', 'CUSTOMER', 'Nashik', NULL, TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '15 days');

INSERT INTO products (id, seller_id, title, description, category, price, currency, quantity_available, unit, listing_status, language, region, image_url, created_at, updated_at) VALUES
(1, 1, 'Mini Tiller 7HP', 'Well-maintained 7HP mini tiller suitable for small plots and orchards. Includes standard rotavator blades. Inspection welcome.', 'MACHINERY', 45000.00, 'INR', 1, 'PIECE', 'ACTIVE', 'mr', 'Nashik', NULL, CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(2, 3, 'Drip Irrigation Pipe Connector', '16mm drip irrigation connectors, 250 pieces available. UV-stable agricultural grade, suitable for row crops.', 'IRRIGATION', 120.00, 'INR', 250, 'PIECE', 'ACTIVE', 'en', 'Nagpur', NULL, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(3, 2, 'Onion Seeds N-53', 'Certified N-53 onion seed from the current season. Germination tested; stored in sealed bags. Packed in 1kg units.', 'SEEDS', 850.00, 'INR', 40, 'KG', 'ACTIVE', 'mr', 'Nashik', NULL, CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(4, 2, 'Vermicompost Organic Fertilizer', 'Farm-produced vermicompost, sieved and bagged. Suitable for vegetables and fruit orchards. Pickup from farm.', 'FERTILIZERS', 15.00, 'INR', 500, 'KG', 'ACTIVE', 'en', 'Pune', NULL, CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(5, 1, 'Knapsack Battery Sprayer', '16 litre battery-operated knapsack sprayer with two nozzles and charger. Ideal for grape and vegetable plots.', 'TOOLS', 3200.00, 'INR', 5, 'PIECE', 'ACTIVE', 'en', 'Nashik', NULL, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(6, 3, 'Borewell Submersible Pump 1HP', 'Single-phase 1HP submersible pump. Sold and removed from service in working condition.', 'IRRIGATION', 12500.00, 'INR', 0, 'PIECE', 'SOLD', 'en', 'Nagpur', NULL, CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(7, 2, 'Neem Oil Pesticide', 'Cold-pressed neem oil for pest management. 25 litres available in sealed cans. Usage guidance provided.', 'PESTICIDES', 450.00, 'INR', 25, 'LITRE', 'ACTIVE', 'hi', 'Pune', NULL, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(8, 1, 'Rotavator 5 Feet', 'Five-foot rotavator previously used with a 45HP tractor. Listing paused while maintenance is completed.', 'MACHINERY', 38000.00, 'INR', 1, 'PIECE', 'INACTIVE', 'en', 'Nashik', NULL, CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '1 day');

INSERT INTO product_requests (id, requester_id, title, description, category, region, quantity, unit, language, status, created_at, updated_at) VALUES
(1, 4, 'Mini tiller for a two-acre field', 'Looking for a used mini tiller in working condition. Can inspect in or around Nashik.', 'MACHINERY', 'Nashik', 1, 'PIECE', 'en', 'OPEN', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 5, 'Power tiller required for orchard', 'Need a power tiller for inter-cultivation in a grape orchard. Purchase preferred.', 'MACHINERY', 'Nashik', 1, 'PIECE', 'en', 'OPEN', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(3, 6, 'Mini tiller wanted', 'Small farm owner looking for a mini tiller. Rental offers with a purchase option are also welcome.', 'MACHINERY', 'Nashik', 1, 'PIECE', 'mr', 'OPEN', CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
(4, 4, 'Drip irrigation connectors', 'Need 100 pieces of 16mm connectors for a small plot.', 'IRRIGATION', 'Nashik', 100, 'PIECE', 'en', 'OPEN', CURRENT_TIMESTAMP - INTERVAL '8 hours', CURRENT_TIMESTAMP - INTERVAL '8 hours');

INSERT INTO search_events (id, user_id, query, category, region, language, matched, result_count, created_at) VALUES
(1, 4, 'mini tiller', 'MACHINERY', 'Nashik', 'en', FALSE, 0, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(2, 5, 'power tiller', 'MACHINERY', 'Nashik', 'en', FALSE, 0, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(3, 6, 'मिनी टिलर', 'MACHINERY', 'Nashik', 'mr', FALSE, 0, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(4, NULL, 'tractor rotavator', 'MACHINERY', 'Pune', 'en', FALSE, 0, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(5, 4, 'onion seeds', 'SEEDS', 'Nashik', 'en', TRUE, 1, CURRENT_TIMESTAMP - INTERVAL '1 day');

INSERT INTO notifications (id, user_id, type, title, message, is_read, related_product_id, related_request_id, related_opportunity_id, created_at) VALUES
(1, 1, 'DEMAND_OPPORTUNITY', 'Nashik machinery demand is rising', 'Three separate customers requested mini/power tillers in Nashik. Your mini tiller listing is relevant.', FALSE, 1, 1, NULL, CURRENT_TIMESTAMP - INTERVAL '8 hours'),
(2, 1, 'SYSTEM', 'Welcome to KrushiMart', 'Complete your farm profile and enable notifications to receive relevant demand opportunities.', TRUE, NULL, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '30 days');

SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products));
SELECT setval(pg_get_serial_sequence('product_requests', 'id'), (SELECT MAX(id) FROM product_requests));
SELECT setval(pg_get_serial_sequence('search_events', 'id'), (SELECT MAX(id) FROM search_events));
SELECT setval(pg_get_serial_sequence('notifications', 'id'), (SELECT MAX(id) FROM notifications));
