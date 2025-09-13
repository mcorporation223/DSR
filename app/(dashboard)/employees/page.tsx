import { EmployeesTable } from "./components/employees-table";

export default function EmployeesPage() {
  return (
    <div className="p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
      </div>

      {/* Table with all functionality */}
      <EmployeesTable />
    </div>
  );
}
