ALTER TABLE "detainees" DROP CONSTRAINT "detainees_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "detainees" DROP CONSTRAINT "detainees_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "employees" DROP CONSTRAINT "employees_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "employees" DROP CONSTRAINT "employees_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "seizures" DROP CONSTRAINT "seizures_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "seizures" DROP CONSTRAINT "seizures_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "statements" DROP CONSTRAINT "statements_detainee_id_detainees_id_fk";
--> statement-breakpoint
ALTER TABLE "statements" DROP CONSTRAINT "statements_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "statements" DROP CONSTRAINT "statements_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "victims" DROP CONSTRAINT "victims_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "victims" DROP CONSTRAINT "victims_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "detainees" ADD CONSTRAINT "detainees_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detainees" ADD CONSTRAINT "detainees_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seizures" ADD CONSTRAINT "seizures_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seizures" ADD CONSTRAINT "seizures_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statements" ADD CONSTRAINT "statements_detainee_id_detainees_id_fk" FOREIGN KEY ("detainee_id") REFERENCES "public"."detainees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statements" ADD CONSTRAINT "statements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statements" ADD CONSTRAINT "statements_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "victims" ADD CONSTRAINT "victims_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "victims" ADD CONSTRAINT "victims_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;