# Database

PostgreSQL 16 is the intended runtime database. Flyway creates the schema; Hibernate validates it and
never auto-generates production tables.

## Migrations

| Location | Purpose |
| --- | --- |
| `backend/src/main/resources/db/migration/V1__init.sql` | Schema, constraints, indexes |
| `backend/src/main/resources/db/seed/V2__dev_seed.sql` | Demo users, listings, requests, searches, notifications |

`application.yml` loads only `classpath:db/migration`. `application-dev.yml` adds
`classpath:db/seed`, so demo records exist only when the `dev` profile is active. Tests disable
Flyway and use H2 in PostgreSQL compatibility mode with `ddl-auto: create-drop`.

Never apply the dev seed to a shared or public environment. It contains known passwords and public
phone numbers.

## Entity relationships

```text
users 1 ----- * products
users 1 ----- * product_requests
users 1 ----- * search_events          (nullable; anonymous searches allowed)
users 1 ----- * notifications

product_requests.category + region ---> demand_opportunities (logical aggregate key)
products.category + region        ---> demand signal supplied to the same aggregate
```

Demand opportunities are not foreign-keyed to requests or searches. They are a derived, current-state
snapshot keyed uniquely by `(category, region)`. This allows a bucket to expire without deleting the
underlying evidence.

Notifications keep nullable related IDs rather than foreign keys so inbox history survives entity
changes and remains simple. Ownership is enforced in the service layer.

## Tables

### `users`

| Column | Type | Rules |
| --- | --- | --- |
| `id` | bigint identity | Primary key |
| `full_name` | varchar(120) | Required |
| `phone` | varchar(10) | Required, unique; login identifier |
| `password_hash` | varchar(100) | BCrypt hash |
| `role` | varchar(20) | `FARMER`, `CUSTOMER`, `BOTH` |
| `region` | varchar(80) | Required approximate region |
| `preferred_categories` | varchar(255) | Comma-separated category enum names |
| `notify_opt_in` | boolean | Default true |
| `contact_visible` | boolean | Default true; seller phone consent |
| `created_at` | timestamptz | Default now |

### `products`

| Column | Type | Rules |
| --- | --- | --- |
| `id` | bigint identity | Primary key |
| `seller_id` | bigint | FK users, required |
| `title` | varchar(140) | Required |
| `description` | varchar(2000) | Required |
| `category` | varchar(30) | Category enum |
| `price` | numeric(12,2) | >= 0 |
| `currency` | varchar(3) | Default `INR` |
| `quantity_available` | numeric(12,2) | >= 0 |
| `unit` | varchar(20) | Unit enum |
| `listing_status` | varchar(20) | `ACTIVE`, `INACTIVE`, `SOLD` |
| `language` | varchar(5) | `en`, `hi`, `mr` |
| `region` | varchar(80) | Approximate region |
| `image_url` | varchar(500) | Nullable |
| `created_at`, `updated_at` | timestamptz | Default now |

`available` is derived: `listing_status = ACTIVE AND quantity_available > 0`. It is not stored.

Indexes support availability/category/region search, seller ownership, and recency sorting.

### `search_events`

Records one marketplace search attempt. `matched` and `result_count` describe whether the search had
results at the time. Only unmatched events with category and region become demand signals.

`user_id` is nullable and uses `ON DELETE SET NULL`, so anonymous and later-deleted-user searches do
not break the table. The demand index is `(matched, category, region, created_at DESC)`.

### `product_requests`

Explicit buyer demand. Status is `OPEN`, `FULFILLED`, or `CANCELLED`; only `OPEN` requests inside the
30-day window are aggregated. Quantity must be greater than zero. Indexes cover the demand query and
requester history.

### `demand_opportunities`

One current row per `(category, region)`:

- `score` and `threshold` are numeric with score constrained to 0–100.
- Counts `request_count`, `distinct_requesters`, `unmatched_searches`, and `active_listings` are stored
  for transparency.
- `reason` is the human-readable formula explanation shown in the UI.
- `status` is `OPEN` or `EXPIRED`.
- `last_demand_at` drives recency; `created_at` survives refreshes; `updated_at` changes each refresh.

A unique constraint on category + region plus an index on `(status, score DESC)` supports upserts and
the farmer feed.

### `notifications`

Per-user in-app messages with type, title, message, `is_read`, nullable related IDs, and creation
time. Indexed by `(user_id, created_at DESC)` and `(user_id, is_read)`.

The service checks existing notifications before creating request matches or opportunity alerts. This
provides idempotency at the application level; there is no unique database constraint on related IDs.

## Dev seed

`V2__dev_seed.sql` creates:

- Six users, all with the BCrypt hash of `password`.
- Eight listings across machinery, irrigation, seeds, fertilizer, tools, and pesticides, including one
  sold item and one inactive item.
- Four open requests, three of which are Nashik machinery demand.
- Five search events, including matched, unmatched, anonymous, and Marathi entries.
- Two notifications for the Nashik farmer.

The script resets identity sequences after explicit IDs. Timestamps are relative to migration time so
the 30-day demand window remains useful during a demo.

## Optional supplementary SQL

`database/seed/sample-products.sql` adds two idempotent listings for local exploration. It assumes the
dev users exist and uses `NOT EXISTS` to avoid duplicates. It is not part of Flyway.

## Reset local database

With Docker Compose:

```powershell
docker compose down -v
docker compose up --build
```

The named volume `postgres_data` contains the database. Removing it forces migrations and dev seed to
run again.

## Production notes

- Use a dedicated migration-only database role and runtime role if possible.
- Set strong database credentials and `JWT_SECRET` outside source control.
- Run with a non-dev profile; the schema migration remains, but the seed location is not loaded.
- Back up the volume/database before upgrades.
- `ddl-auto` is `validate`; never switch it to `update` in production.
