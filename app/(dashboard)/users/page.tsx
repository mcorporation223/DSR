import { UsersTable } from "./components/user-table";
import { UserCardsList } from "./components/user-cards-list";

export default function UsersPage() {
  return (
    <>
      {/* Desktop View - Table */}
      <div className="hidden md:block p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
        <UsersTable />
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden p-4 mt-4">
        <UserCardsList />
      </div>
    </>
  );
}
