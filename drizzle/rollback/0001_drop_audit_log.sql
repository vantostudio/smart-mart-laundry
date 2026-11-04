-- Rollback for 0001_drop_audit_log: puts back the admin_event table and the admin_user columns it
-- dropped (empty: their data is gone), then removes the migrator's journal row so
-- `pnpm db:migrate` can apply it again. Run it before the 0000 rollback.
-- Run with: psql "$DATABASE_URL_UNPOOLED" -f drizzle/rollback/0001_drop_audit_log.sql
ALTER TABLE "admin_user" ADD COLUMN "auth_user_id" text;
ALTER TABLE "admin_user" ADD COLUMN "disabled_at" timestamp with time zone;
ALTER TABLE "admin_user" ADD COLUMN "created_by" uuid;
ALTER TABLE "admin_user" ADD COLUMN "last_sign_in_at" timestamp with time zone;
ALTER TABLE "admin_user" ADD CONSTRAINT "admin_user_auth_user_id_unique" UNIQUE("auth_user_id");
ALTER TABLE "admin_user" ADD CONSTRAINT "admin_user_created_by_admin_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_user"("id");
CREATE TABLE "admin_event" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"action" text NOT NULL,
	"actor_admin_id" uuid REFERENCES "public"."admin_user"("id"),
	"target_admin_id" uuid REFERENCES "public"."admin_user"("id"),
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"request_id" text NOT NULL,
	CONSTRAINT "admin_event_action_check" CHECK ("action" in ('sign_in', 'sign_in_denied', 'sign_out', 'admin_added', 'admin_role_changed', 'admin_disabled', 'admin_enabled'))
);
CREATE INDEX "admin_event_at_idx" ON "admin_event" USING btree ("at" DESC NULLS LAST);
DELETE FROM "drizzle"."__drizzle_migrations" WHERE "created_at" = 1793803269270;
