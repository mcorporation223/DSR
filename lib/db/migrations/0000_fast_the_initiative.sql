CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"action" varchar(32) NOT NULL,
	"entity_type" varchar(32) NOT NULL,
	"entity_id" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "detainees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"sex" varchar(10) NOT NULL,
	"place_of_birth" varchar(255),
	"date_of_birth" timestamp,
	"parent_names" text,
	"origin_neighborhood" varchar(255),
	"education" text,
	"employment" varchar(255),
	"marital_status" varchar(50),
	"marital_details" text,
	"religion" varchar(100),
	"residence" varchar(255),
	"phone_number" varchar(20),
	"crime_reason" text,
	"arrest_date" timestamp,
	"arrest_location" varchar(255),
	"arrested_by" varchar(255),
	"arrest_time" timestamp,
	"arrival_time" timestamp,
	"cell_number" varchar(50),
	"location" varchar(255),
	"status" varchar(50) DEFAULT 'in_custody',
	"release_date" timestamp,
	"release_reason" text,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"sex" varchar(10) NOT NULL,
	"place_of_birth" varchar(255),
	"date_of_birth" timestamp,
	"education" text,
	"marital_status" varchar(50),
	"employee_id" varchar(50),
	"function" varchar(100),
	"deployment_location" varchar(255),
	"residence" varchar(255),
	"phone" varchar(20),
	"email" varchar(255),
	"photo_url" varchar(500),
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_employee_id_unique" UNIQUE("employee_id"),
	CONSTRAINT "employees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_date" timestamp NOT NULL,
	"location" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"number_of_victims" integer DEFAULT 0,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"created_by" uuid,
	"updated_by" uuid,
	"report_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seizures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL,
	"seizure_location" varchar(255),
	"chassis_number" varchar(100),
	"plate_number" varchar(50),
	"owner_name" varchar(255),
	"owner_residence" varchar(255),
	"seizure_date" timestamp NOT NULL,
	"status" varchar(50) DEFAULT 'in_custody',
	"release_date" timestamp,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "victims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"sex" varchar(10) NOT NULL,
	"cause_of_death" text,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detainees" ADD CONSTRAINT "detainees_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detainees" ADD CONSTRAINT "detainees_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seizures" ADD CONSTRAINT "seizures_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seizures" ADD CONSTRAINT "seizures_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statements" ADD CONSTRAINT "statements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statements" ADD CONSTRAINT "statements_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "victims" ADD CONSTRAINT "victims_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "victims" ADD CONSTRAINT "victims_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "victims" ADD CONSTRAINT "victims_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_entity_type_idx" ON "audit_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "audit_entity_id_idx" ON "audit_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "audit_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "detainee_first_name_idx" ON "detainees" USING btree ("first_name");--> statement-breakpoint
CREATE INDEX "detainee_last_name_idx" ON "detainees" USING btree ("last_name");--> statement-breakpoint
CREATE INDEX "detainee_status_idx" ON "detainees" USING btree ("status");--> statement-breakpoint
CREATE INDEX "detainee_arrest_date_idx" ON "detainees" USING btree ("arrest_date");--> statement-breakpoint
CREATE INDEX "incident_date_idx" ON "incidents" USING btree ("incident_date");--> statement-breakpoint
CREATE INDEX "incident_type_idx" ON "incidents" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "incident_location_idx" ON "incidents" USING btree ("location");--> statement-breakpoint
CREATE INDEX "seizure_type_idx" ON "seizures" USING btree ("type");--> statement-breakpoint
CREATE INDEX "seizure_date_idx" ON "seizures" USING btree ("seizure_date");--> statement-breakpoint
CREATE INDEX "seizure_status_idx" ON "seizures" USING btree ("status");--> statement-breakpoint
CREATE INDEX "victim_incident_idx" ON "victims" USING btree ("incident_id");