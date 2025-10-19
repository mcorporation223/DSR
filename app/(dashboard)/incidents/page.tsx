import { IncidentTable } from "./components/incident-table";
import { IncidentCardsList } from "./components/incident-cards-list";

export default function IncidentsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <IncidentTable />
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden">
        <IncidentCardsList />
      </div>
    </div>
  );
}
