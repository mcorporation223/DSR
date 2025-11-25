ALTER TABLE "seizures" ADD COLUMN "seizure_details" text;--> statement-breakpoint
ALTER TABLE "seizures" ADD COLUMN "photo_url" varchar(500);--> statement-breakpoint
ALTER TABLE "seizures" DROP COLUMN "chassis_number";--> statement-breakpoint
ALTER TABLE "seizures" DROP COLUMN "plate_number";