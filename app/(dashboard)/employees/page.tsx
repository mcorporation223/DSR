import { EmployeesTable } from "./components/employees-table";
import { EmployeeCardsList } from "./components/employee-cards-list";

export default function EmployeesPage() {
  return (
    <>
      {/* Desktop View - Table */}
      <div className="hidden md:block p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
        <EmployeesTable />
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden p-4 mt-4">
        <EmployeeCardsList />
      </div>
    </>
  );
}
