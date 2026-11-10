-- Rollback for 0004_shop_settings: drops the table, then removes the migrator's journal row so
-- `pnpm db:migrate` can apply it again. Run it before the 0003 rollback.
-- Run with: psql "$DATABASE_URL_UNPOOLED" -f drizzle/rollback/0004_shop_settings.sql
DROP TABLE "shop_settings";
DELETE FROM "drizzle"."__drizzle_migrations" WHERE "created_at" = 1793894938337;
