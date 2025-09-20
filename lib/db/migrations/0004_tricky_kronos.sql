ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "setup_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "setup_token_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_password_set" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "must_change_password" boolean DEFAULT false NOT NULL;