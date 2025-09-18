import { router } from "../trpc";
import { employeesRouter } from "./employees";
import { detaineesRouter } from "./detainees";
import { incidentsRouter } from "./incidents";
import { seizuresRouter } from "./seizures";
import { reportsRouter } from "./reports";
import { statementsRouter } from "./statements";
import { dashboardRouter } from "./dashboard";
import { usersRouter } from "./users";

export const appRouter = router({
  dashboard: dashboardRouter,
  employees: employeesRouter,
  detainees: detaineesRouter,
  incidents: incidentsRouter,
  seizures: seizuresRouter,
  reports: reportsRouter,
  statements: statementsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
