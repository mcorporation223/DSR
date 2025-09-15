import { router } from "../trpc";
import { employeesRouter } from "./employees";
import { detaineesRouter } from "./detainees";
import { incidentsRouter } from "./incidents";
import { seizuresRouter } from "./seizures";

export const appRouter = router({
  employees: employeesRouter,
  detainees: detaineesRouter,
  incidents: incidentsRouter,
  seizures: seizuresRouter,
});

export type AppRouter = typeof appRouter;
