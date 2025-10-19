"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Search,
  Filter,
  Loader2,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
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
import { SeizureForm } from "./seizure-form";
import { EditSeizureForm } from "./edit-seizure-form";
import { DeleteSeizureDialog } from "./delete-seizure-dialog";
import { SeizureDetailsDialog } from "./seizure-details-dialog";

// Types for seizure data
interface Seizure extends Record<string, unknown> {
  id: string;
  itemName: string;
  type: string;
  seizureLocation: string | null;
  chassisNumber: string | null;
  plateNumber: string | null;
  ownerName: string | null;
  ownerResidence: string | null;
  seizureDate: Date;
  status: string | null;
  releaseDate: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdByName?: string | null; // User name fields from backend joins
  updatedByName?: string | null;
}

export function SeizureTable() {
  // All the state that was previously in the page component
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "seizureDate" | "itemName" | "type" | "status" | "createdAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [columnVisibility, setColumnVisibility] = useState<
    ColumnVisibilityOption[]
  >(seizureColumnConfig.map((col) => ({ ...col, visible: true })));

  // Edit seizure state
  const [editingSeizure, setEditingSeizure] = useState<Seizure | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete seizure state
  const [deletingSeizure, setDeletingSeizure] = useState<Seizure | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Details seizure state
  const [viewingSeizure, setViewingSeizure] = useState<Seizure | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const itemsPerPage = 10;

  // TRPC query for seizures
  const {
    data: seizuresData,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.seizures.getAll.useQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    sortBy,
    sortOrder,
    type: typeFilter,
    status: statusFilter,
  });

  const seizures =
    seizuresData?.seizures?.map((seizure) => ({
      ...seizure,
      seizureDate: new Date(seizure.seizureDate),
      releaseDate: seizure.releaseDate ? new Date(seizure.releaseDate) : null,
      createdAt: new Date(seizure.createdAt),
      updatedAt: new Date(seizure.updatedAt),
    })) || [];
  const pagination = seizuresData?.pagination;

  // All the handlers
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

  const handleTypeFilter = useCallback((type: string | undefined) => {
    setTypeFilter(type);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handleStatusFilter = useCallback((status: string | undefined) => {
    setStatusFilter(status);
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

  // Handle adding new seizure
  const handleSeizureSuccess = useCallback(() => {
    refetch(); // Refresh the seizures list
  }, [refetch]);

  // Handle editing seizure
  const handleEditSeizure = useCallback((seizure: Seizure) => {
    setEditingSeizure(seizure);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingSeizure(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    refetch(); // Refresh the seizures list
  }, [refetch]);

  // Handle deleting seizure
  const handleDeleteSeizure = useCallback((seizure: Seizure) => {
    setDeletingSeizure(seizure);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeletingSeizure(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refetch(); // Refresh the seizures list
  }, [refetch]);

  // Handle viewing seizure details
  const handleViewSeizure = useCallback((seizure: Seizure) => {
    setViewingSeizure(seizure);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleDetailsDialogClose = useCallback(() => {
    setIsDetailsDialogOpen(false);
    setViewingSeizure(null);
  }, []);

  const allColumns: TableColumn<Seizure>[] = [
    {
      key: "type",
      label: "Type",
      className: "w-32 px-4",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900">{value as string}</span>
      ),
    },
    {
      key: "itemName",
      label: "Nom/Description",
      className: "w-48",
      sortable: true,
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[180px]"
          title={value as string}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "seizureDate",
      label: "Date Saisie",
      className: "w-32",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900">
          {new Date(value as Date).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "seizureLocation",
      label: "Lieu Saisie",
      className: "w-36",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[130px]"
          title={(value as string) || "N/A"}
        >
          {(value as string) || "-"}
        </span>
      ),
    },
    {
      key: "ownerName",
      label: "Propriétaire",
      className: "w-40",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[150px]"
          title={(value as string) || "N/A"}
        >
          {(value as string) || "-"}
        </span>
      ),
    },
    {
      key: "plateNumber",
      label: "Plaque",
      className: "w-24",
      render: (value) => (
        <span className="text-sm text-gray-900 font-mono">
          {(value as string) || "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      className: "w-32",
      sortable: true,
      render: (value) => {
        const status = (value as string) || "in_custody";
        let colorClass = "";
        let displayText = "";
        switch (status) {
          case "in_custody":
            colorClass = "bg-yellow-500";
            displayText = "En garde";
            break;
          case "released":
            colorClass = "bg-green-500";
            displayText = "Libéré";
            break;
          case "disposed":
            colorClass = "bg-red-500";
            displayText = "Disposé";
            break;
          default:
            colorClass = "bg-gray-500";
            displayText = status;
        }
        return (
          <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center ${colorClass}`}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {displayText}
            </span>
          </div>
        );
      },
    },
    {
      key: "releaseDate",
      label: "Date Restitution",
      className: "w-36",
      render: (value) => (
        <span className="text-sm text-gray-900">
          {value ? new Date(value as Date).toLocaleDateString("fr-FR") : "-"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date de Création",
      className: "w-36",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {new Date(value as Date).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "w-24",
      align: "center",
      render: (_, seizure) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => handleViewSeizure(seizure)}
          >
            <Eye className="w-4 h-4" />
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
              <DropdownMenuItem onSelect={() => handleEditSeizure(seizure)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => handleDeleteSeizure(seizure)}
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
          <h1 className="text-2xl font-bold text-gray-900">Saisies</h1>
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
            onClick={() => {
              handleTypeFilter(undefined);
              handleStatusFilter(undefined);
            }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Tous
          </Button>
          <Button
            variant={typeFilter === "Voiture" ? "default" : "outline"}
            className={
              typeFilter === "Voiture"
                ? ""
                : "border-gray-300 bg-white text-gray-700"
            }
            onClick={() => handleTypeFilter("Voiture")}
          >
            Voitures
          </Button>
          <Button
            variant={typeFilter === "Moto" ? "default" : "outline"}
            className={
              typeFilter === "Moto"
                ? ""
                : "border-gray-300 bg-white text-gray-700"
            }
            onClick={() => handleTypeFilter("Moto")}
          >
            Motos
          </Button>

          {/* Column Visibility & Add Button */}
          <ColumnVisibility
            columns={columnVisibility}
            onVisibilityChange={handleColumnVisibilityChange}
            storageKey="seizures-columns"
          />
          <SeizureForm onSuccess={handleSeizureSuccess} />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-gray-600">Chargement des saisies...</span>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <DataTable<Seizure>
          columns={columns}
          data={seizures}
          keyField="id"
          emptyMessage="Aucune saisie trouvée"
          pagination={paginationConfig}
          showPagination={!!paginationConfig}
          sortConfig={sortConfig}
          onRowClick={handleViewSeizure}
        />
      )}

      {/* Edit Seizure Dialog */}
      <EditSeizureForm
        seizure={editingSeizure}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Seizure Dialog */}
      <DeleteSeizureDialog
        seizure={deletingSeizure}
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onSuccess={handleDeleteSuccess}
      />

      {/* Seizure Details Dialog */}
      <SeizureDetailsDialog
        seizure={viewingSeizure}
        isOpen={isDetailsDialogOpen}
        onClose={handleDetailsDialogClose}
      />
    </div>
  );
}

// Define column configuration for visibility control
export const seizureColumnConfig = [
  { key: "type", label: "Type", hideable: false },
  { key: "itemName", label: "Nom/Description", hideable: false },
  { key: "seizureDate", label: "Date Saisie", hideable: false },
  { key: "seizureLocation", label: "Lieu Saisie", hideable: false },
  { key: "ownerName", label: "Propriétaire", hideable: true },
  { key: "plateNumber", label: "Plaque", hideable: true },
  { key: "status", label: "Statut", hideable: false },
  { key: "releaseDate", label: "Date Restitution", hideable: true },
  { key: "createdAt", label: "Date de Création", hideable: false },
  { key: "actions", label: "Actions", hideable: false },
];

// Export the Seizure type so it can be used in other files
export type { Seizure };

// Keep Saisie as alias for backward compatibility
export type Saisie = Seizure;
