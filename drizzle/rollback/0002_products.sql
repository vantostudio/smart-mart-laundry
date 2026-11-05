-- Rollback for 0002_products: drops the product table (its rows are gone) and the code sequence,
-- then removes the migrator's journal row so `pnpm db:migrate` can apply it again. Run it before
-- the 0001 rollback.
-- Run with: psql "$DATABASE_URL_UNPOOLED" -f drizzle/rollback/0002_products.sql
DROP TABLE "product";
DROP SEQUENCE "product_code_seq";
DELETE FROM "drizzle"."__drizzle_migrations" WHERE "created_at" = 1793878168682;
