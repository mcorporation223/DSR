import { DetaineesTable } from "./components/detainee-table";
import { DetaineeCardsList } from "./components/detainee-cards-list";

export default function DetaineesPage() {
  return (
    <div className="p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
      {/* Desktop View - Table */}
      <div className="hidden md:block">
        <DetaineesTable />
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden">
        <DetaineeCardsList />
      </div>
    </div>
  );
}
