CREATE TABLE "user_provinces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"province" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_provinces_user_id_province_unique" UNIQUE("user_id","province")
);
--> statement-breakpoint
ALTER TABLE "user_provinces" ADD CONSTRAINT "user_provinces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_provinces_user_idx" ON "user_provinces" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_provinces_province_idx" ON "user_provinces" USING btree ("province");