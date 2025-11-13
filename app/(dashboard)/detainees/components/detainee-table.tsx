"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
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
import { DetaineeForm } from "./detainee-form";
import { EditDetaineeForm } from "./edit-detainee-form";
import { DeleteDetaineeDialog } from "./delete-detainee-dialog";
import { DetaineeDetailsDialog } from "./detainee-details-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFileUrl } from "@/lib/upload-utils";

// Types for detainee data - Updated to match database schema exactly
interface Detainee extends Record<string, unknown> {
  id: string;
  firstName: string | null;
  lastName: string | null;
  sex: string;
  placeOfBirth: string | null;
  dateOfBirth: string | null; // This comes as string from the database
  photoUrl: string | null;
  parentNames: string | null;
  originNeighborhood: string | null;
  education: string | null;
  employment: string | null;
  maritalStatus: string | null;
  numberOfChildren: number | null;
  spouseName: string | null;
  religion: string | null;
  residence: string | null;
  phoneNumber: string | null;
  crimeReason: string | null;
  arrestDate: string | null; // This comes as string from the database
  arrestLocation: string | null;
  arrestedBy: string | null;
  arrivalDate: string | null;
  location: string | null;
  status: string | null;
  releaseDate: string | null;
  releaseReason: string | null;
  transferDestination: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string; // This comes as string from the database
  updatedAt: string; // This comes as string from the database
  createdByName?: string | null; // User name fields from backend joins
  updatedByName?: string | null;
}

export function DetaineesTable() {
  // All the state that was previously in the page component
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "firstName" | "lastName" | "arrestDate" | "createdAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [columnVisibility, setColumnVisibility] = useState<
    ColumnVisibilityOption[]
  >(detaineeColumnConfig.map((col) => ({ ...col, visible: true })));

  // Edit detainee state
  const [editingDetainee, setEditingDetainee] = useState<Detainee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete detainee state
  const [deletingDetainee, setDeletingDetainee] = useState<Detainee | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detaineeToView, setDetaineeToView] = useState<Detainee | null>(null);

  const itemsPerPage = 10;

  // TRPC query for detainees
  const {
    data: detaineesData,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.detainees.getAll.useQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    sortBy,
    sortOrder,
    status: statusFilter,
  });

  const detainees = detaineesData?.detainees || [];
  const pagination = detaineesData?.pagination;

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

  const handleFilterChange = useCallback((status: string | undefined) => {
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

  // Handle adding new detainee
  const handleDetaineeSuccess = useCallback(() => {
    refetch(); // Refresh the detainees list
  }, [refetch]);

  // Handle editing detainee
  const handleEditDetainee = useCallback((detainee: Detainee) => {
    setEditingDetainee(detainee);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingDetainee(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    refetch(); // Refresh the detainees list
  }, [refetch]);

  // Handle deleting detainee
  const handleDeleteDetainee = useCallback((detainee: Detainee) => {
    setDeletingDetainee(detainee);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeletingDetainee(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refetch(); // Refresh the detainees list
  }, [refetch]);

  // Handle view detainee details
  const handleViewDetainee = useCallback((detainee: Detainee) => {
    setDetaineeToView(detainee);
    setDetailsDialogOpen(true);
  }, []);

  const handleDetailsDialogClose = useCallback(() => {
    setDetailsDialogOpen(false);
    setDetaineeToView(null);
  }, []);

  // Handle row click
  const handleRowClick = useCallback(
    (detainee: Detainee) => {
      handleViewDetainee(detainee);
    },
    [handleViewDetainee]
  );

  // Get status display text
  const getStatusDisplay = (status: string | null) => {
    switch (status) {
      case "in_custody":
        return { text: "En détention", color: "bg-red-500" };
      case "released":
        return { text: "Libéré", color: "bg-green-500" };
      case "transferred":
        return { text: "Transféré", color: "bg-blue-500" };
      default:
        return { text: "Inconnu", color: "bg-gray-500" };
    }
  };

  const allColumns: TableColumn<Detainee>[] = [
    {
      key: "firstName",
      label: "Nom",
      className: "w-48 px-4",
      sortable: true,
      render: (value, detainee) => {
        const fullName = `${detainee.firstName || ""} ${
          detainee.lastName || ""
        }`.trim();

        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={detainee.photoUrl ? getFileUrl(detainee.photoUrl) : ""}
                  alt={fullName || "User"}
                />
                <AvatarFallback className="bg-gray-200">
                  {fullName
                    ? fullName
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "D"}
                </AvatarFallback>
              </Avatar>
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
      key: "education",
      label: "Études",
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
      key: "employment",
      label: "Emploi",
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
      key: "crimeReason",
      label: "Motif d'Arrestation",
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
      key: "arrestDate",
      label: "Date d'Arrestation",
      className: "w-36",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900">
          {value
            ? new Date(value as string).toLocaleDateString("fr-FR")
            : "N/A"}
        </span>
      ),
    },
    {
      key: "arrestLocation",
      label: "Lieu d'Arrestation",
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
      key: "status",
      label: "Statut",
      className: "w-32",
      render: (value) => {
        const statusInfo = getStatusDisplay(value as string);
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
      key: "phoneNumber",
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
      key: "religion",
      label: "Religion",
      className: "w-28",
      render: (value) => (
        <span className="text-sm text-gray-900">
          {(value as string) || "N/A"}
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
      key: "actions",
      label: "Actions",
      className: "w-24",
      align: "center",
      render: (_, detainee) => (
        <div
          className="flex items-center justify-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => handleViewDetainee(detainee)}
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
              <DropdownMenuItem onSelect={() => handleEditDetainee(detainee)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled
                onSelect={() => handleDeleteDetainee(detainee)}
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
          <h1 className="text-2xl font-bold text-gray-900">Détenus</h1>
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
            variant={statusFilter === "in_custody" ? "default" : "outline"}
            className={
              statusFilter === "in_custody"
                ? ""
                : "border-gray-300 bg-white text-gray-700"
            }
            onClick={() => handleFilterChange("in_custody")}
          >
            En détention
          </Button>
          <Button
            variant={statusFilter === "released" ? "default" : "outline"}
            className={
              statusFilter === "released"
                ? ""
                : "border-gray-300 bg-white text-gray-700"
            }
            onClick={() => handleFilterChange("released")}
          >
            Libérés
          </Button>
          <Button
            variant={statusFilter === "transferred" ? "default" : "outline"}
            className={
              statusFilter === "transferred"
                ? ""
                : "border-gray-300 bg-white text-gray-700"
            }
            onClick={() => handleFilterChange("transferred")}
          >
            Transférés
          </Button>

          {/* Column Visibility & Add Button */}
          <ColumnVisibility
            columns={columnVisibility}
            onVisibilityChange={handleColumnVisibilityChange}
            storageKey="detainees-columns"
          />
          <DetaineeForm onSuccess={handleDetaineeSuccess} />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Spinner className="w-4 h-4" />
            <span className="text-gray-600">Chargement des détenus...</span>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <DataTable<Detainee>
          columns={columns}
          data={detainees}
          keyField="id"
          emptyState={
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun détenu trouvé
              </h3>
              <p className="text-sm text-gray-500 max-w-sm text-center">
                {searchTerm || statusFilter
                  ? "Aucun détenu ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                  : "Commencez par enregistrer le premier détenu dans le système."}
              </p>
            </div>
          }
          pagination={paginationConfig}
          showPagination={!!paginationConfig}
          sortConfig={sortConfig}
          onRowClick={handleRowClick}
        />
      )}

      {/* Edit Detainee Dialog */}
      <EditDetaineeForm
        detainee={editingDetainee}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Detainee Dialog */}
      <DeleteDetaineeDialog
        detainee={deletingDetainee}
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onSuccess={handleDeleteSuccess}
      />

      {/* Details Dialog */}
      <DetaineeDetailsDialog
        detainee={detaineeToView}
        isOpen={detailsDialogOpen}
        onClose={handleDetailsDialogClose}
      />
    </div>
  );
}

// Define column configuration for visibility control
export const detaineeColumnConfig = [
  { key: "firstName", label: "Nom", hideable: false },
  { key: "sex", label: "Sexe", hideable: true },
  { key: "placeOfBirth", label: "Lieu de Naissance", hideable: true },
  { key: "dateOfBirth", label: "Date de Naissance", hideable: true },
  { key: "education", label: "Études", hideable: true },
  { key: "employment", label: "Emploi", hideable: true },
  { key: "residence", label: "Résidence", hideable: false },
  { key: "crimeReason", label: "Motif d'Arrestation", hideable: false },
  { key: "arrestDate", label: "Date d'Arrestation", hideable: false },
  { key: "arrestLocation", label: "Lieu d'Arrestation", hideable: true },
  { key: "status", label: "Statut", hideable: false },
  { key: "phoneNumber", label: "Téléphone", hideable: true },
  { key: "religion", label: "Religion", hideable: true },
  { key: "maritalStatus", label: "État Civil", hideable: true },
  { key: "createdAt", label: "Date de Création", hideable: false },
  { key: "actions", label: "Actions", hideable: false },
];

// Export the Detainee type so it can be used in other files
export type { Detainee };
