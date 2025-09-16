import { router } from "../trpc";
import { employeesRouter } from "./employees";
import { detaineesRouter } from "./detainees";
import { incidentsRouter } from "./incidents";
import { seizuresRouter } from "./seizures";
import { reportsRouter } from "./reports";
import { statementsRouter } from "./statements";

export const appRouter = router({
  employees: employeesRouter,
  detainees: detaineesRouter,
  incidents: incidentsRouter,
  seizures: seizuresRouter,
  reports: reportsRouter,
  statements: statementsRouter,
});

export type AppRouter = typeof appRouter;
