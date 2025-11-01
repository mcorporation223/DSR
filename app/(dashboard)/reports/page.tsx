import { ReportsTable } from "./components/reports-table";
import { ReportCardsList } from "./components/report-cards-list";

export default function ReportsPage() {
  return (
    <>
      {/* Desktop View - Table */}
      <div className="hidden md:block p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
        <ReportsTable />
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden p-4 mt-4">
        <ReportCardsList />
      </div>
    </>
  );
}
