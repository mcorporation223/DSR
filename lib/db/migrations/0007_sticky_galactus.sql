ALTER TABLE "detainees" ADD COLUMN "photo_url" varchar(500);--> statement-breakpoint
ALTER TABLE "detainees" ADD COLUMN "number_of_children" integer;--> statement-breakpoint
ALTER TABLE "detainees" ADD COLUMN "spouse_name" varchar(100);--> statement-breakpoint
ALTER TABLE "detainees" DROP COLUMN "marital_details";--> statement-breakpoint
ALTER TABLE "detainees" DROP COLUMN "arrest_time";--> statement-breakpoint
ALTER TABLE "detainees" DROP COLUMN "arrival_time";--> statement-breakpoint
ALTER TABLE "detainees" DROP COLUMN "cell_number";