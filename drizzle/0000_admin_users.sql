CREATE TABLE "admin_event" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_event_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"action" text NOT NULL,
	"actor_admin_id" uuid,
	"target_admin_id" uuid,
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"request_id" text NOT NULL,
	CONSTRAINT "admin_event_action_check" CHECK ("admin_event"."action" in ('sign_in', 'sign_in_denied', 'sign_out', 'admin_added', 'admin_role_changed', 'admin_disabled', 'admin_enabled'))
);
--> statement-breakpoint
CREATE TABLE "admin_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"auth_user_id" text,
	"disabled_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_sign_in_at" timestamp with time zone,
	CONSTRAINT "admin_user_email_unique" UNIQUE("email"),
	CONSTRAINT "admin_user_auth_user_id_unique" UNIQUE("auth_user_id"),
	CONSTRAINT "admin_user_email_lower" CHECK ("admin_user"."email" = lower("admin_user"."email")),
	CONSTRAINT "admin_user_role_check" CHECK ("admin_user"."role" in ('owner', 'admin'))
);
--> statement-breakpoint
ALTER TABLE "admin_event" ADD CONSTRAINT "admin_event_actor_admin_id_admin_user_id_fk" FOREIGN KEY ("actor_admin_id") REFERENCES "public"."admin_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_event" ADD CONSTRAINT "admin_event_target_admin_id_admin_user_id_fk" FOREIGN KEY ("target_admin_id") REFERENCES "public"."admin_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_user" ADD CONSTRAINT "admin_user_created_by_admin_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_event_at_idx" ON "admin_event" USING btree ("at" DESC NULLS LAST);