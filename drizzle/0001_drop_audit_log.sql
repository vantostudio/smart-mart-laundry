DROP TABLE "admin_event" CASCADE;--> statement-breakpoint
ALTER TABLE "admin_user" DROP CONSTRAINT "admin_user_auth_user_id_unique";--> statement-breakpoint
ALTER TABLE "admin_user" DROP CONSTRAINT "admin_user_created_by_admin_user_id_fk";
--> statement-breakpoint
ALTER TABLE "admin_user" DROP COLUMN "auth_user_id";--> statement-breakpoint
ALTER TABLE "admin_user" DROP COLUMN "disabled_at";--> statement-breakpoint
ALTER TABLE "admin_user" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "admin_user" DROP COLUMN "last_sign_in_at";