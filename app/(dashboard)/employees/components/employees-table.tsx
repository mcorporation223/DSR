"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Download,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
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
import { EmployeeForm, type EmployeeFormValues } from "./employee-form";

// Types for employee data - Updated to match database schema exactly
interface Employee extends Record<string, unknown> {
  id: string;
  firstName: string | null;
  lastName: string | null;
  sex: string;
  placeOfBirth: string | null;
  dateOfBirth: string | null; // This comes as string from the database
  education: string | null;
  maritalStatus: string | null;
  employeeId: string | null;
  function: string | null;
  deploymentLocation: string | null;
  residence: string | null;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  isActive: boolean | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string; // This comes as string from the database
  updatedAt: string; // This comes as string from the database
}

export function EmployeesTable() {
  // All the state that was previously in the page component
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "firstName" | "lastName" | "email" | "createdAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(
    undefined
  );
  const [columnVisibility, setColumnVisibility] = useState<
    ColumnVisibilityOption[]
  >(employeeColumnConfig.map((col) => ({ ...col, visible: true })));

  const itemsPerPage = 10;

  // TRPC query for employees - moved from page component
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
    sortBy,
    sortOrder,
    isActive: activeFilter,
  });

  const employees = employeesData?.employees || [];
  const pagination = employeesData?.pagination;

  // All the handlers moved from page component
  const handleColumnVisibilityChange = useCallback(
    (columns: ColumnVisibilityOption[]) => {
      setColumnVisibility(columns);
    },
    []
  );

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleFilterChange = useCallback((isActive: boolean | undefined) => {
    setActiveFilter(isActive);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handleSort = useCallback(
    (columnKey: string) => {
      if (columnKey === sortBy) {
        // If clicking the same column, toggle sort order
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        // If clicking a different column, set new column and default to desc
        setSortBy(columnKey as typeof sortBy);
        setSortOrder("desc");
      }
      setCurrentPage(1); // Reset to first page when sorting
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

  // Handle adding new employee
  const handleAddEmployee = (data: EmployeeFormValues) => {
    // This will be implemented when we add create mutation
    console.log("New employee data:", data);
  };
  const allColumns: TableColumn<Employee>[] = [
    {
      key: "firstName",
      label: "Nom",
      className: "w-48 px-4",
      sortable: true,
      render: (value, employee) => {
        const fullName = `${employee.firstName || ""} ${
          employee.lastName || ""
        }`.trim();
        const initials = fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-gray-600">
                {initials}
              </span>
            </div>
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
      key: "sex",
      label: "Sexe",
      className: "w-20",
      render: (value) => (
        <span className="text-sm text-gray-900">
          {(value as string) || "N/A"}
        </span>
      ),
    },
    {
      key: "placeOfBirth",
      label: "Lieu de Naissance",
      className: "w-36",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[130px]"
          title={(value as string) || "N/A"}
        >
          {(value as string) || "N/A"}
        </span>
      ),
    },
    {
      key: "dateOfBirth",
      label: "Date de Naissance",
      className: "w-32",
      render: (value) => (
        <span className="text-sm text-gray-900">
          {value
            ? new Date(value as string).toLocaleDateString("fr-FR")
            : "N/A"}
        </span>
      ),
    },
    {
      key: "maritalStatus",
      label: "État Civil",
      className: "w-28",
      render: (value) => (
        <span className="text-sm text-gray-900">
          {(value as string) || "N/A"}
        </span>
      ),
    },
    {
      key: "function",
      label: "Fonction",
      className: "w-40",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[150px]"
          title={(value as string) || "N/A"}
        >
          {(value as string) || "N/A"}
        </span>
      ),
    },
    {
      key: "education",
      label: "Formation",
      className: "w-40",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[150px]"
          title={(value as string) || "N/A"}
        >
          {(value as string) || "N/A"}
        </span>
      ),
    },
    {
      key: "deploymentLocation",
      label: "Lieu de Déploiement",
      className: "w-44",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[160px]"
          title={(value as string) || "N/A"}
        >
          {(value as string) || "N/A"}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Téléphone",
      className: "w-32",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[120px]"
          title={(value as string) || "N/A"}
        >
          {(value as string) || "N/A"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      className: "w-48",
      sortable: true,
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[180px]"
          title={(value as string) || "N/A"}
        >
          {(value as string) || "N/A"}
        </span>
      ),
    },
    {
      key: "residence",
      label: "Résidence",
      className: "w-36",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[130px]"
          title={(value as string) || "N/A"}
        >
          {(value as string) || "N/A"}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Statut",
      className: "w-28",
      render: (value) => (
        <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max">
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center ${
              value ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {value ? (
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <span className="text-sm font-medium text-gray-900">
            {value ? "Actif" : "Inactif"}
          </span>
        </div>
      ),
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
      label: "Date de Modification",
      className: "w-40",
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
      render: () => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
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
          <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
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

          {/* Filters */}
          <Button
            variant="outline"
            className="border-gray-300 bg-white text-gray-700"
            onClick={() => handleFilterChange(undefined)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Tous
          </Button>
          <Button
            variant={activeFilter === true ? "default" : "outline"}
            className={
              activeFilter === true
                ? ""
                : "border-gray-300 bg-white text-gray-700"
            }
            onClick={() => handleFilterChange(true)}
          >
            Actifs
          </Button>
          <Button
            variant={activeFilter === false ? "default" : "outline"}
            className={
              activeFilter === false
                ? ""
                : "border-gray-300 bg-white text-gray-700"
            }
            onClick={() => handleFilterChange(false)}
          >
            Inactifs
          </Button>

          {/* Column Visibility & Add Button */}
          <ColumnVisibility
            columns={columnVisibility}
            onVisibilityChange={handleColumnVisibilityChange}
            storageKey="employees-columns"
          />
          <EmployeeForm onSubmit={handleAddEmployee} />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-gray-600">Chargement des employés...</span>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <DataTable<Employee>
          columns={columns}
          data={employees}
          keyField="id"
          emptyMessage="Aucun employé trouvé"
          pagination={paginationConfig}
          showPagination={!!paginationConfig}
          sortConfig={sortConfig}
        />
      )}
    </div>
  );
}

// Define column configuration for visibility control
export const employeeColumnConfig = [
  { key: "firstName", label: "Nom", hideable: false },
  { key: "sex", label: "Sexe", hideable: true },
  { key: "placeOfBirth", label: "Lieu de Naissance", hideable: true },
  { key: "dateOfBirth", label: "Date de Naissance", hideable: true },
  { key: "maritalStatus", label: "État Civil", hideable: true },
  { key: "function", label: "Fonction", hideable: false },
  { key: "education", label: "Formation", hideable: true },
  { key: "deploymentLocation", label: "Lieu de Déploiement", hideable: false },
  { key: "phone", label: "Téléphone", hideable: false },
  { key: "email", label: "Email", hideable: true },
  { key: "residence", label: "Résidence", hideable: true },
  { key: "isActive", label: "Statut", hideable: false },
  { key: "createdAt", label: "Date de Création", hideable: false },
  { key: "updatedAt", label: "Date de Modification", hideable: false },
  { key: "actions", label: "Actions", hideable: false },
];

// Export the Employee type so it can be used in other files
export type { Employee };
