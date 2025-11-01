import { AuditLogsTable } from "./components/audit-logs-table";
import { AuditLogCardsList } from "./components/audit-log-cards-list";

export default function AuditLogsPage() {
  return (
    <>
      {/* Desktop View - Table */}
      <div className="hidden md:block p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
        <AuditLogsTable />
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden p-4 mt-4">
        <AuditLogCardsList />
      </div>
    </>
  );
}
