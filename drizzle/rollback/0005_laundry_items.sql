-- Rollback for 0005_laundry_items: drops the table, then removes the migrator's journal row so
-- `pnpm db:migrate` can apply it again. Run it before the 0004 rollback.
-- Run with: psql "$DATABASE_URL_UNPOOLED" -f drizzle/rollback/0005_laundry_items.sql
DROP TABLE "laundry_item";
DELETE FROM "drizzle"."__drizzle_migrations" WHERE "created_at" = 1793912935230;
