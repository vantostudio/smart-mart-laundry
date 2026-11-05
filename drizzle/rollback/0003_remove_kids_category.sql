-- Rollback for 0003_remove_kids_category: lets the product table take 'kids' again, then removes
-- the migrator's journal row so `pnpm db:migrate` can apply it again. Run it before the 0002
-- rollback.
-- Run with: psql "$DATABASE_URL_UNPOOLED" -f drizzle/rollback/0003_remove_kids_category.sql
ALTER TABLE "product" DROP CONSTRAINT "product_category_check";
ALTER TABLE "product" ADD CONSTRAINT "product_category_check" CHECK ("product"."category" in ('ladies', 'men', 'kids', 'shoes'));
DELETE FROM "drizzle"."__drizzle_migrations" WHERE "created_at" = 1793892953670;
