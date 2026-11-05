CREATE SEQUENCE "public"."product_code_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1001 CACHE 1;--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text DEFAULT 'SM-' || nextval('product_code_seq') NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"condition" text NOT NULL,
	"price" integer NOT NULL,
	"sizes" text[] DEFAULT '{}'::text[] NOT NULL,
	"stock" integer NOT NULL,
	"images" text[] DEFAULT '{}'::text[] NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_code_unique" UNIQUE("code"),
	CONSTRAINT "product_category_check" CHECK ("product"."category" in ('ladies', 'men', 'kids', 'shoes')),
	CONSTRAINT "product_condition_check" CHECK ("product"."condition" in ('new', 'mtumba')),
	CONSTRAINT "product_price_check" CHECK ("product"."price" >= 0),
	CONSTRAINT "product_stock_check" CHECK ("product"."stock" >= 0)
);
--> statement-breakpoint
CREATE INDEX "product_list_idx" ON "product" USING btree ("created_at","id");