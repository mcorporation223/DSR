import { SeizureTable } from "./components/seizure-table";
import { SeizureCardsList } from "./components/seizure-cards-list";

export default function SeizurePage() {
  return (
    <div className="p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <SeizureTable />
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden">
        <SeizureCardsList />
      </div>
    </div>
  );
}
