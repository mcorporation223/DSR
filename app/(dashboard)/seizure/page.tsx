import { SeizureCardsList } from "./components/seizure-cards-list";
import { SeizureTable } from "./components/seizure-table";

export default function SeizurePage() {
  return (
    <>
      {/* Desktop View - Table */}
      <div className="hidden md:block p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
        <SeizureTable />
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden p-4 mt-4">
        <SeizureCardsList />
      </div>
    </>
  );
}
