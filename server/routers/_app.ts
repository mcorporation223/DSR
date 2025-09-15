import { router } from "../trpc";
import { employeesRouter } from "./employees";
import { detaineesRouter } from "./detainees";
import { incidentsRouter } from "./incidents";

export const appRouter = router({
  employees: employeesRouter,
  detainees: detaineesRouter,
  incidents: incidentsRouter,
});

export type AppRouter = typeof appRouter;
