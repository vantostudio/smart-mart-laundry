CREATE TABLE "laundry_item" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"image" text NOT NULL,
	"mark" text,
	"position" integer NOT NULL,
	CONSTRAINT "laundry_item_category_check" CHECK ("laundry_item"."category" in ('baskets', 'duvets', 'mats', 'shoes')),
	CONSTRAINT "laundry_item_price_check" CHECK ("laundry_item"."price" > 0)
);
--> statement-breakpoint
CREATE INDEX "laundry_item_order_idx" ON "laundry_item" USING btree ("position");
--> statement-breakpoint
INSERT INTO "laundry_item" ("id", "category", "name", "description", "price", "image", "mark", "position") VALUES
	('basket-small', 'baskets', 'Small basket', 'Fits a week of clothes for one person.', 150, 'photo-1591130901959-9723d22a59ed', 'S', 1),
	('basket-medium', 'baskets', 'Medium basket', 'Ideal for a couple''s weekly load.', 250, 'photo-1582735689369-4fe89db7114c', 'M', 2),
	('basket-large', 'baskets', 'Large basket', 'Plenty of room for a family load.', 350, 'photo-1645542554266-b275c100103c', 'L', 3),
	('basket-xl', 'baskets', 'Extra large basket', 'Our biggest basket for heavy household loads.', 400, 'photo-1639739767611-cc582846849f', 'XL', 4),
	('duvet-6x6', 'duvets', '6 × 6 duvet', 'Deep cleaned and dried, returned fresh and fluffy.', 350, 'photo-1702501543049-4cb666eeda15', '6×6', 5),
	('duvet-4x6', 'duvets', '4 × 6 duvet', 'Ready to go straight back on the bed.', 250, 'photo-1640747669771-b82a6e40f534', '4×6', 6),
	('duvet-3-2x6', 'duvets', '3.2 × 6 duvet', 'Deep cleaned and dried, quick turnaround.', 200, 'photo-1733980403355-1f60487f99f9', '3.2×6', 7),
	('duvet-cot', 'duvets', 'Baby cot duvet', 'Gentle wash for the littlest bedding.', 150, 'photo-1739874244845-64aeccd01432', 'Cot', 8),
	('mat-door', 'mats', 'Door mat', 'Mud and dust lifted out, scrubbed and dried.', 50, 'photo-1549295265-b0c1f7fb6147', NULL, 9),
	('mat-fluffy', 'mats', 'Fluffy mat', 'Pile brushed back up after drying.', 200, 'photo-1520762042279-ae3264026bd2', NULL, 10),
	('mat-floor', 'mats', 'Floor mat', 'Deep cleaned on both sides.', 350, 'photo-1672403391906-810131b660eb', NULL, 11),
	('shoes-white', 'shoes', 'Plain white shoes', 'Hand cleaned, per pair.', 150, 'photo-1641792669588-b9754e4257ac', NULL, 12),
	('shoes-coloured', 'shoes', 'Coloured shoes', 'Hand cleaned, per pair.', 100, 'photo-1692620334820-355161f652a8', NULL, 13);
