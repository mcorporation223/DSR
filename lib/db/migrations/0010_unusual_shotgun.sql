ALTER TABLE "user_provinces" ALTER COLUMN "province" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "province" varchar(100);--> statement-breakpoint
ALTER TABLE "detainees" ADD COLUMN "province" varchar(100);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "province" varchar(100);--> statement-breakpoint
ALTER TABLE "incidents" ADD COLUMN "province" varchar(100);--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "province" varchar(100);--> statement-breakpoint
ALTER TABLE "seizures" ADD COLUMN "province" varchar(100);--> statement-breakpoint
ALTER TABLE "statements" ADD COLUMN "province" varchar(100);