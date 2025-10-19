"use client";

import { EmployeeCard } from "./employee-card";
import type { Employee } from "./employees-table";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { trpc } from "@/components/trpc-provider";
import { EmployeeForm } from "./employee-form";
import { DeleteEmployeeDialog } from "./delete-employee-dialog";
import { EmployeeDetailsDialog } from "./employee-details-dialog";

// Mobile Pagination Component
interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

function MobilePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: MobilePaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <div className="text-sm text-gray-600 text-center">
        Affichage de{" "}
        <span className="font-medium">
          {startItem} à {endItem}
        </span>{" "}
        sur <span className="font-medium">{totalItems}</span> résultats
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-4"
        >
          Précédent
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-10 h-10 text-sm font-medium rounded-lg ${
                  pageNum === currentPage
                    ? "text-white bg-blue-500"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-4"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}

interface EmployeeCardsListProps {
  emptyMessage?: string;
}

export function EmployeeCardsList({
  emptyMessage = "Aucun employé trouvé",
}: EmployeeCardsListProps) {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(
    undefined
  );

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null
  );
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [employeeToView, setEmployeeToView] = useState<Employee | null>(null);

  const itemsPerPage = 10;

  // TRPC query for employees
  const {
    data: employeesData,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.employees.getAll.useQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
    isActive: activeFilter,
  });

  const employees = employeesData?.employees || [];
  const pagination = employeesData?.pagination;

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((isActive: boolean | undefined) => {
    setActiveFilter(isActive);
    setCurrentPage(1);
  }, []);

  const handleEmployeeSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDeleteEmployee = useCallback((employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refetch();
    handleDeleteDialogClose();
  }, [refetch, handleDeleteDialogClose]);

  const handleViewEmployee = useCallback((employee: Employee) => {
    setEmployeeToView(employee);
    setDetailsDialogOpen(true);
  }, []);

  const handleDetailsDialogClose = useCallback(() => {
    setDetailsDialogOpen(false);
    setEmployeeToView(null);
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Employés</h1>
          <EmployeeForm onSuccess={handleEmployeeSuccess} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeFilter === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(undefined)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Tous
          </Button>
          <Button
            variant={activeFilter === true ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(true)}
          >
            Actifs
          </Button>
          <Button
            variant={activeFilter === false ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(false)}
          >
            Inactifs
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-gray-600">Chargement des employés...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && employees.length === 0 && (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun employé
            </h3>
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        </div>
      )}

      {/* Cards List */}
      {!isLoading && employees.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onView={handleViewEmployee}
              onDelete={handleDeleteEmployee}
              onEmployeeSuccess={handleEmployeeSuccess}
            />
          ))}
        </div>
      )}

      {/* Mobile Pagination */}
      {!isLoading && pagination && pagination.totalPages > 1 && (
        <MobilePagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.limit}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Dialog */}
      {employeeToDelete && (
        <DeleteEmployeeDialog
          employee={employeeToDelete}
          isOpen={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {/* Details Dialog */}
      <EmployeeDetailsDialog
        employee={employeeToView}
        isOpen={detailsDialogOpen}
        onClose={handleDetailsDialogClose}
      />
    </div>
  );
}
