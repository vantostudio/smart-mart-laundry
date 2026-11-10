CREATE TABLE "shop_settings" (
	"id" boolean PRIMARY KEY DEFAULT true NOT NULL,
	"delivery_fee" integer NOT NULL,
	"delivery_free_from" integer NOT NULL,
	"phone" text NOT NULL,
	"week_open" integer NOT NULL,
	"week_close" integer NOT NULL,
	"sunday_open" integer NOT NULL,
	"sunday_close" integer NOT NULL,
	CONSTRAINT "shop_settings_one_row" CHECK ("shop_settings"."id"),
	CONSTRAINT "shop_settings_delivery_check" CHECK ("shop_settings"."delivery_fee" >= 0 and "shop_settings"."delivery_free_from" >= 0),
	CONSTRAINT "shop_settings_week_hours_check" CHECK ("shop_settings"."week_open" >= 0 and "shop_settings"."week_open" < "shop_settings"."week_close" and "shop_settings"."week_close" <= 24),
	CONSTRAINT "shop_settings_sunday_hours_check" CHECK ("shop_settings"."sunday_open" >= 0 and "shop_settings"."sunday_open" < "shop_settings"."sunday_close" and "shop_settings"."sunday_close" <= 24)
);
--> statement-breakpoint
INSERT INTO "shop_settings" ("delivery_fee", "delivery_free_from", "phone", "week_open", "week_close", "sunday_open", "sunday_close") VALUES (100, 1500, '254113154708', 7, 20, 9, 16);
