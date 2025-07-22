CREATE TABLE "items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"small_bundle_price" integer,
	"large_bundle_price" integer
);
-- --> statement-breakpoint
-- CREATE TABLE "participants" (
-- 	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
-- 	"name" text NOT NULL,
-- 	"email" text NOT NULL,
-- 	"created_at" timestamp DEFAULT now(),
-- 	"team_id" uuid,
-- 	CONSTRAINT "participants_email_unique" UNIQUE("email")
-- );
--> statement-breakpoint
-- CREATE TABLE "teams" (
-- 	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
-- 	"name" text NOT NULL,
-- 	"code" text NOT NULL,
-- 	"owner_id" uuid NOT NULL,
-- 	"tokens" integer DEFAULT 1500 NOT NULL,
-- 	CONSTRAINT "teams_code_unique" UNIQUE("code")
-- );
--> statement-breakpoint
CREATE TABLE "won_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"item_id" text NOT NULL,
	"amount_purchased" integer NOT NULL,
	"base_amount" integer NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
-- ALTER TABLE "participants" ADD CONSTRAINT "participants_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "won_items" ADD CONSTRAINT "won_items_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "won_items" ADD CONSTRAINT "won_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;