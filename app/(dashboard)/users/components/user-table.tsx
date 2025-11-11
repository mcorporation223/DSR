"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Key,
  Inbox,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DataTable,
  TableColumn,
  PaginationConfig,
  SortConfig,
} from "@/components/data-table";
import { useState, useCallback, useMemo } from "react";
import {
  ColumnVisibility,
  type ColumnVisibilityOption,
} from "@/components/column-visibility";
import { trpc } from "@/components/trpc-provider";
import { UserForm } from "./user-form";
import { EditUserForm } from "./edit-user-form";
import { DeleteUserDialog } from "./delete-user-dialog";
import { UserDetailsDialog } from "./user-details-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";

// Types for user data - Based on database schema
interface User extends Record<string, unknown> {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  isActive: boolean;
  isPasswordSet: boolean;
  createdAt: string;
  updatedAt: string;
}

export function UsersTable() {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "firstName" | "lastName" | "email" | "createdAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "pending" | undefined
  >(undefined);
  const [columnVisibility, setColumnVisibility] = useState<
    ColumnVisibilityOption[]
  >(userColumnConfig.map((col) => ({ ...col, visible: true })));
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [resettingPasswordUser, setResettingPasswordUser] =
    useState<User | null>(null);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);

  const itemsPerPage = 10;

  // Convert statusFilter to boolean for backend
  const getBackendStatusFilter = (): boolean | undefined => {
    switch (statusFilter) {
      case "active":
        return true;
      case "inactive":
        return false;
      case "pending":
        return true; // Pending users are technically active but without password
      default:
        return undefined;
    }
  };

  // TRPC query for users
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.users.getAll.useQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    sortBy,
    sortOrder,
    role: roleFilter,
    isActive: getBackendStatusFilter(),
  });

  const users = useMemo(() => usersData?.users || [], [usersData?.users]);
  const pagination = usersData?.pagination;

  // Apply client-side filtering for pending status
  const filteredUsers = useMemo(() => {
    if (statusFilter === "pending") {
      return users.filter((user) => user.isActive && !user.isPasswordSet);
    }
    return users;
  }, [users, statusFilter]);

  // Handlers
  const handleColumnVisibilityChange = useCallback(
    (columns: ColumnVisibilityOption[]) => {
      setColumnVisibility(columns);
    },
    []
  );

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleRoleFilterChange = useCallback((role: string | undefined) => {
    setRoleFilter(role);
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback(
    (status: "all" | "active" | "inactive" | "pending" | undefined) => {
      setStatusFilter(status);
      setCurrentPage(1);
    },
    []
  );

  const handleSort = useCallback(
    (columnKey: string) => {
      if (columnKey === sortBy) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(columnKey as typeof sortBy);
        setSortOrder("desc");
      }
      setCurrentPage(1);
    },
    [sortBy]
  );

  const paginationConfig: PaginationConfig = useMemo(
    () => ({
      currentPage: pagination?.page || 1,
      totalPages: pagination?.totalPages || 1,
      totalItems: pagination?.totalItems || 0,
      itemsPerPage: pagination?.limit || itemsPerPage,
      onPageChange: setCurrentPage,
    }),
    [pagination]
  );

  const sortConfig: SortConfig = useMemo(
    () => ({
      sortBy,
      sortOrder,
      onSort: handleSort,
    }),
    [sortBy, sortOrder, handleSort]
  );

  const visibleColumnKeys = columnVisibility
    .filter((col) => col.visible)
    .map((col) => col.key);

  // Handle adding new user
  const handleUserSuccess = useCallback(() => {
    refetch(); // Refresh the users list
  }, [refetch]);

  // Handle edit user success
  const handleEditUserSuccess = useCallback(() => {
    refetch(); // Refresh the users list
    setIsEditDialogOpen(false);
    setEditingUser(null);
  }, [refetch]);

  // Handle delete user success
  const handleDeleteUserSuccess = useCallback(() => {
    refetch(); // Refresh the users list
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
  }, [refetch]);

  // Handle view user
  const handleViewUser = useCallback((user: User) => {
    setViewingUser(user);
    setIsDetailsDialogOpen(true);
  }, []);

  // Handle edit from details dialog
  const handleEditFromDetails = useCallback((user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
    setIsDetailsDialogOpen(false);
    setViewingUser(null);
  }, []);

  // Handle edit user
  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  }, []);

  // Handle delete user
  const handleDeleteUser = useCallback((user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  }, []);

  // Handle reset password
  const handleResetPassword = useCallback((user: User) => {
    setResettingPasswordUser(user);
    setIsResetPasswordDialogOpen(true);
  }, []);

  // Handle row click
  const handleRowClick = useCallback(
    (user: User) => {
      handleViewUser(user);
    },
    [handleViewUser]
  );

  // Get role display text
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return { text: "Administrateur", color: "bg-blue-500" };
      case "user":
        return { text: "Utilisateur", color: "bg-green-500" };
      default:
        return { text: role, color: "bg-gray-500" };
    }
  };

  // Get status display text
  const getStatusDisplay = (isActive: boolean, isPasswordSet: boolean) => {
    if (!isPasswordSet && isActive) {
      return { text: "En attente", color: "bg-yellow-500" };
    }
    return isActive
      ? { text: "Actif", color: "bg-green-500" }
      : { text: "Inactif", color: "bg-red-500" };
  };

  const allColumns: TableColumn<User>[] = [
    {
      key: "firstName",
      label: "Nom",
      className: "w-48 px-4",
      sortable: true,
      render: (value, user) => {
        const fullName = `${user.firstName || ""} ${
          user.lastName || ""
        }`.trim();

        return (
          <div className="flex items-center gap-3">
            <div
              className="text-sm font-medium text-gray-900 truncate max-w-[140px]"
              title={fullName}
            >
              {fullName || "N/A"}
            </div>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Email",
      className: "w-56",
      sortable: true,
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[200px]"
          title={value as string}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "role",
      label: "Rôle",
      className: "w-32",
      render: (value) => {
        const roleInfo = getRoleDisplay(value as string);
        return (
          <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center ${roleInfo.color}`}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {roleInfo.text}
            </span>
          </div>
        );
      },
    },
    {
      key: "isActive",
      label: "Statut",
      className: "w-32",
      render: (value, user) => {
        const statusInfo = getStatusDisplay(
          value as boolean,
          user.isPasswordSet
        );
        return (
          <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center ${statusInfo.color}`}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {statusInfo.text}
            </span>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date de Création",
      className: "w-36",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {new Date(value as string).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "Dernière Modification",
      className: "w-36",
      render: (value) => (
        <span className="text-sm text-gray-600">
          {new Date(value as string).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "w-24",
      align: "center",
      render: (_, user) => (
        <div
          className="flex items-center justify-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => handleViewUser(user)}
          >
            <Eye className="w-4 h-4 cursor-pointer" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => handleEditUser(user)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleResetPassword(user)}>
                <Key className="w-4 h-4 mr-2" />
                Réinitialiser mot de passe
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => handleDeleteUser(user)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // Filter columns based on visibility
  const columns = visibleColumnKeys
    ? allColumns.filter((column) => visibleColumnKeys.includes(column.key))
    : allColumns;

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Erreur lors du chargement
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "Une erreur est survenue"}
          </p>
          <Button onClick={() => refetch()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            />
          </div>

          {/* Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-gray-300 bg-white text-gray-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
                {(roleFilter || statusFilter !== undefined) && (
                  <span className="ml-1 h-2 w-2 bg-blue-500 rounded-full"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Filtrer par rôle
                </p>
                <div className="space-y-1">
                  <DropdownMenuItem
                    className={`cursor-pointer ${
                      !roleFilter ? "bg-blue-50 text-blue-700" : ""
                    }`}
                    onSelect={() => handleRoleFilterChange(undefined)}
                  >
                    <div className="flex items-center">
                      {!roleFilter && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      )}
                      Tous les rôles
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`cursor-pointer ${
                      roleFilter === "admin" ? "bg-blue-50 text-blue-700" : ""
                    }`}
                    onSelect={() => handleRoleFilterChange("admin")}
                  >
                    <div className="flex items-center">
                      {roleFilter === "admin" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      )}
                      Administrateurs
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`cursor-pointer ${
                      roleFilter === "user" ? "bg-blue-50 text-blue-700" : ""
                    }`}
                    onSelect={() => handleRoleFilterChange("user")}
                  >
                    <div className="flex items-center">
                      {roleFilter === "user" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      )}
                      Utilisateurs
                    </div>
                  </DropdownMenuItem>
                </div>
              </div>

              <div className="border-t border-gray-200 px-2 py-1">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Filtrer par statut
                </p>
                <div className="space-y-1">
                  <DropdownMenuItem
                    className={`cursor-pointer ${
                      statusFilter === undefined
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }`}
                    onSelect={() => handleStatusFilterChange(undefined)}
                  >
                    <div className="flex items-center">
                      {statusFilter === undefined && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      )}
                      Tous les statuts
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`cursor-pointer ${
                      statusFilter === "active"
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }`}
                    onSelect={() => handleStatusFilterChange("active")}
                  >
                    <div className="flex items-center">
                      {statusFilter === "active" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      )}
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Actifs
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`cursor-pointer ${
                      statusFilter === "pending"
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }`}
                    onSelect={() => handleStatusFilterChange("pending")}
                  >
                    <div className="flex items-center">
                      {statusFilter === "pending" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      )}
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      En attente
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`cursor-pointer ${
                      statusFilter === "inactive"
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }`}
                    onSelect={() => handleStatusFilterChange("inactive")}
                  >
                    <div className="flex items-center">
                      {statusFilter === "inactive" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      )}
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Inactifs
                    </div>
                  </DropdownMenuItem>
                </div>
              </div>

              {(roleFilter || statusFilter !== undefined) && (
                <>
                  <div className="border-t border-gray-200 px-2 py-1">
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600"
                      onSelect={() => {
                        handleRoleFilterChange(undefined);
                        handleStatusFilterChange(undefined);
                      }}
                    >
                      Réinitialiser tous les filtres
                    </DropdownMenuItem>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column Visibility */}
          <ColumnVisibility
            columns={columnVisibility}
            onVisibilityChange={handleColumnVisibilityChange}
            storageKey="users-columns"
          />

          {/* Add User Form */}
          <UserForm onSuccess={handleUserSuccess} />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Spinner className="w-4 h-4" />
            <span className="text-gray-600">
              Chargement des utilisateurs...
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <DataTable<User>
          columns={columns}
          data={filteredUsers}
          keyField="id"
          emptyState={
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun utilisateur trouvé
              </h3>
              <p className="text-sm text-gray-500 max-w-sm text-center">
                {searchTerm || roleFilter || statusFilter
                  ? "Aucun utilisateur ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                  : "Commencez par ajouter votre premier utilisateur pour gérer l'accès au système."}
              </p>
            </div>
          }
          pagination={paginationConfig}
          showPagination={!!paginationConfig}
          sortConfig={sortConfig}
          onRowClick={handleRowClick}
        />
      )}

      {/* Edit User Dialog */}
      <EditUserForm
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSuccess={handleEditUserSuccess}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingUser(null);
        }}
        user={deletingUser}
        onSuccess={handleDeleteUserSuccess}
      />

      {/* User Details Dialog */}
      <UserDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setViewingUser(null);
        }}
        user={viewingUser}
        onEdit={handleEditFromDetails}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        isOpen={isResetPasswordDialogOpen}
        onClose={() => {
          setIsResetPasswordDialogOpen(false);
          setResettingPasswordUser(null);
        }}
        user={resettingPasswordUser}
        onSuccess={() => {
          // Optionally refresh data or show confirmation
          refetch();
        }}
      />
    </div>
  );
}

// Define column configuration for visibility control
export const userColumnConfig = [
  { key: "firstName", label: "Nom", hideable: false },
  { key: "email", label: "Email", hideable: false },
  { key: "role", label: "Rôle", hideable: false },
  { key: "isActive", label: "Statut", hideable: false },
  { key: "createdAt", label: "Date de Création", hideable: true },
  { key: "updatedAt", label: "Dernière Modification", hideable: true },
  { key: "actions", label: "Actions", hideable: false },
];

// Export the User type so it can be used in other files
export type { User };
