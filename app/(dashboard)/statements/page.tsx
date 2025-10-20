import { StatementsTable } from "./components/statements-table";
import { StatementCardsList } from "./components/statement-cards-list";

export default function StatementsPage() {
  return (
    <div className="p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
      {/* Desktop View - Table */}
      <div className="hidden md:block">
        <StatementsTable />
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden">
        <StatementCardsList />
      </div>
    </div>
  );
}
