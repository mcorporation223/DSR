import { UsersTable } from "./components/user-table";

export default function UsersPage() {
  return (
    <div className="p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
      <UsersTable />
    </div>
  );
}
