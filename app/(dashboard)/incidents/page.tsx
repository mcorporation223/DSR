import { IncidentTable } from "./components/incident-table";

export default function IncidentsPage() {
  return (
    <div className="p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
      <IncidentTable />
    </div>
  );
}
