"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/components/trpc-provider";
import { UserCard } from "./user-card";
import { UserForm } from "./user-form";
import { EditUserForm } from "./edit-user-form";
import { DeleteUserDialog } from "./delete-user-dialog";
import { UserDetailsDialog } from "./user-details-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import type { User } from "./user-table";

// Mobile pagination component
function MobilePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <div className="text-sm text-gray-600 text-center">
        Affichage de <span className="font-medium">{startItem}</span> à{" "}
        <span className="font-medium">{endItem}</span> sur{" "}
        <span className="font-medium">{totalItems}</span> utilisateurs
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </Button>
        <div className="flex items-center gap-1">
          <span className="px-3 py-1 text-sm font-medium bg-blue-500 text-white rounded">
            {currentPage}
          </span>
          <span className="text-sm text-gray-500">sur {totalPages}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-1"
        >
          Suivant
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function UserCardsList() {
  // State management - identical to UsersTable
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "pending" | undefined
  >(undefined);
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
    sortBy: "createdAt",
    sortOrder: "desc",
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
      {/* Mobile Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <UserForm onSuccess={handleUserSuccess} />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            />
          </div>

          {/* Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-gray-300 bg-white text-gray-700 flex-shrink-0"
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
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-gray-600">
              Chargement des utilisateurs...
            </span>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && (
        <>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun utilisateur
                </h3>
                <p className="text-gray-500">Aucun utilisateur trouvé</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onView={handleViewUser}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onResetPassword={handleResetPassword}
                />
              ))}
            </div>
          )}

          {/* Mobile Pagination */}
          {pagination && filteredUsers.length > 0 && (
            <MobilePagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.limit}
              onPageChange={setCurrentPage}
            />
          )}
        </>
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
