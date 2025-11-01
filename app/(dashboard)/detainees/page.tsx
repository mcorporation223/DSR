import { DetaineeCardsList } from "./components/detainee-cards-list";
import { DetaineesTable } from "./components/detainee-table";

export default function DetaineesPage() {
  return (
    <>
      {/* Desktop View - Table */}
      <div className="hidden md:block p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
        <DetaineesTable />
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden p-4 mt-4">
        <DetaineeCardsList />
      </div>
    </>
  );
}
