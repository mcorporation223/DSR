import { IncidentCardsList } from "./components/incident-cards-list";
import { IncidentTable } from "./components/incident-table";

export default function IncidentsPage() {
  return (
    <>
      {/* Desktop View - Table */}
      <div className="hidden md:block p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
        <IncidentTable />
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden p-4 mt-4">
        <IncidentCardsList />
      </div>
    </>
  );
}
