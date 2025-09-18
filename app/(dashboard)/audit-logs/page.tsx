import { AuditLogsTable } from "./components/audit-logs-table";

export default function AuditLogsPage() {
  return (
    <div className="p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
      <AuditLogsTable />
    </div>
  );
}
