-- Rollback for 0000_admin_users: drops the admin_user and admin_event tables it created, then
-- removes the migrator's journal row so `pnpm db:migrate` can apply it again.
-- Run the 0001 rollback first. This loses the admin allowlist. Re-seed the owner with
-- `pnpm db:seed-owner <email>` after re-applying. Backstop: Neon point-in-time restore.
-- Run with: psql "$DATABASE_URL_UNPOOLED" -f drizzle/rollback/0000_admin_users.sql
DROP TABLE "admin_event";
DROP TABLE "admin_user";
DELETE FROM "drizzle"."__drizzle_migrations" WHERE "created_at" = 1793788431039;
