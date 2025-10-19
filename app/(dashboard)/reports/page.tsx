import { ReportsTable } from "./components/reports-table";
import { ReportCardsList } from "./components/report-cards-list";

export default function ReportsPage() {
  return (
    <div className="p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
      {/* Desktop View - Table */}
      <div className="hidden md:block">
        <ReportsTable />
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden">
        <ReportCardsList />
      </div>
    </div>
  );
}
