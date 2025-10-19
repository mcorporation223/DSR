import { UsersTable } from "./components/user-table";
import { UserCardsList } from "./components/user-cards-list";

export default function UsersPage() {
  return (
    <div className="p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <UsersTable />
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden">
        <UserCardsList />
      </div>
    </div>
  );
}
