import { StatementCardsList } from "./components/statement-cards-list";
import { StatementsTable } from "./components/statements-table";

export default function StatementsPage() {
  return (
    <>
      {/* Desktop View - Table */}
      <div className="hidden md:block p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
        <StatementsTable />
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden p-4 mt-4">
        <StatementCardsList />
      </div>
    </>
  );
}
