import { router } from "../trpc";
import { employeesRouter } from "./employees";
// import { detaineesRouter } from "./detainees";

export const appRouter = router({
  employees: employeesRouter,
  // detainees: detaineesRouter,
});

export type AppRouter = typeof appRouter;
