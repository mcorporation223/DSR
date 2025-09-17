"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Download,
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
import { IncidentForm } from "./incident-form";
import { EditIncidentForm } from "./edit-incident-form";
import { DeleteIncidentDialog } from "./delete-incident-dialog";
import { IncidentDetailsDialog } from "./incident-details-dialog";

// Types for incident data
interface Victim {
  id: string;
  name: string;
  sex: "Male" | "Female";
  causeOfDeath?: string | null;
}

interface Incident extends Record<string, unknown> {
  id: string;
  incidentDate: Date;
  location: string;
  eventType: string;
  numberOfVictims: number | null;
  victims: Victim[];
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdByName?: string | null; // User name fields from backend joins
  updatedByName?: string | null;
}

export function IncidentTable() {
  // All the state that was previously in the page component
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "incidentDate" | "location" | "eventType" | "createdAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [eventTypeFilter, setEventTypeFilter] = useState<string | undefined>(
    undefined
  );
  const [columnVisibility, setColumnVisibility] = useState<
    ColumnVisibilityOption[]
  >(incidentColumnConfig.map((col) => ({ ...col, visible: true })));

  // Edit incident state
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete incident state
  const [deletingIncident, setDeletingIncident] = useState<Incident | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [incidentToView, setIncidentToView] = useState<Incident | null>(null);

  const itemsPerPage = 10;

  // TRPC query for incidents
  const {
    data: incidentsData,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.incidents.getAll.useQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    sortBy,
    sortOrder,
    eventType: eventTypeFilter,
  });

  const incidents =
    incidentsData?.incidents?.map((incident) => ({
      ...incident,
      incidentDate: new Date(incident.incidentDate),
      createdAt: new Date(incident.createdAt),
      updatedAt: new Date(incident.updatedAt),
      victims: incident.victims.map((victim) => ({
        ...victim,
        sex: victim.sex as "Male" | "Female",
      })),
    })) || [];
  const pagination = incidentsData?.pagination;

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

  const handleFilterChange = useCallback((eventType: string | undefined) => {
    setEventTypeFilter(eventType);
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

  // Handle adding new incident
  const handleIncidentSuccess = useCallback(() => {
    refetch(); // Refresh the incidents list
  }, [refetch]);

  // Handle editing incident
  const handleEditIncident = useCallback((incident: Incident) => {
    setEditingIncident(incident);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingIncident(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    refetch(); // Refresh the incidents list
  }, [refetch]);

  // Handle deleting incident
  const handleDeleteIncident = useCallback((incident: Incident) => {
    setDeletingIncident(incident);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeletingIncident(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refetch(); // Refresh the incidents list
  }, [refetch]);

  // Handle view incident details
  const handleViewIncident = useCallback((incident: Incident) => {
    setIncidentToView(incident);
    setDetailsDialogOpen(true);
  }, []);

  const handleDetailsDialogClose = useCallback(() => {
    setDetailsDialogOpen(false);
    setIncidentToView(null);
  }, []);

  // Handle row click
  const handleRowClick = useCallback(
    (incident: Incident) => {
      handleViewIncident(incident);
    },
    [handleViewIncident]
  );

  const allColumns: TableColumn<Incident>[] = [
    {
      key: "eventType",
      label: "Type",
      className: "w-32 px-4",
      sortable: true,
      render: (value) => {
        return <span className="text-sm text-gray-900">{value as string}</span>;
      },
    },
    {
      key: "incidentDate",
      label: "Date Incident",
      className: "w-32",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900">
          {new Date(value as Date).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "location",
      label: "Lieu",
      className: "w-36",
      sortable: true,
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[130px]"
          title={value as string}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "numberOfVictims",
      label: "N° de victime",
      className: "w-20",
      align: "center",
      render: (value, row) => {
        // Only show for Assassinats
        if (row.eventType === "Assassinats") {
          return (
            <span className="text-sm text-gray-900 font-medium">
              {value ? (value as number) : "-"}
            </span>
          );
        }
        return <span className="text-sm text-gray-400">-</span>;
      },
    },
    {
      key: "victimsSex",
      label: "Sexe",
      className: "w-24",
      render: (value, row) => {
        // Only show for Assassinats
        if (
          row.eventType === "Assassinats" &&
          row.victims &&
          row.victims.length > 0
        ) {
          const sexes = row.victims.map((v) => v.sex);
          const uniqueSexes = [...new Set(sexes)];
          if (uniqueSexes.length === 1) {
            const displaySex = uniqueSexes[0] === "Male" ? "Homme" : "Femme";
            return <span className="text-sm text-gray-900">{displaySex}</span>;
          } else {
            return <span className="text-sm text-gray-900">Mixte</span>;
          }
        }
        return <span className="text-sm text-gray-400">-</span>;
      },
    },
    {
      key: "victimsCause",
      label: "Cause du Décès",
      className: "w-48",
      render: (value, row) => {
        // Only show for Assassinats
        if (
          row.eventType === "Assassinats" &&
          row.victims &&
          row.victims.length > 0
        ) {
          const causes = row.victims
            .map((v) => v.causeOfDeath)
            .filter((cause) => cause && cause.trim() !== "");
          const uniqueCauses = [...new Set(causes)];
          const displayText =
            uniqueCauses.length > 1
              ? uniqueCauses.join(", ")
              : uniqueCauses[0] || "-";
          return (
            <span
              className="text-sm text-gray-900 truncate block max-w-[180px]"
              title={displayText}
            >
              {displayText}
            </span>
          );
        }
        return <span className="text-sm text-gray-400">-</span>;
      },
    },
    {
      key: "victimsNames",
      label: "Noms",
      className: "w-48",
      render: (value, row) => {
        // Only show for Assassinats
        if (
          row.eventType === "Assassinats" &&
          row.victims &&
          row.victims.length > 0
        ) {
          const noms = row.victims
            .map((v) => v.name)
            .filter((nom) => nom.trim() !== "")
            .join(", ");
          return (
            <span
              className="text-sm text-gray-900 truncate block max-w-[180px]"
              title={noms}
            >
              {noms || "-"}
            </span>
          );
        }
        return <span className="text-sm text-gray-400">-</span>;
      },
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
      render: (_, incident) => (
        <div
          className="flex items-center justify-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => handleViewIncident(incident)}
          >
            <Eye className="w-4 h-4 cursor-pointer" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Download className="w-4 h-4" />
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
              <DropdownMenuItem onSelect={() => handleEditIncident(incident)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => handleDeleteIncident(incident)}
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
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
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
            variant={eventTypeFilter === "Assassinats" ? "default" : "outline"}
            className={
              eventTypeFilter === "Assassinats"
                ? ""
                : "border-gray-300 bg-white text-gray-700"
            }
            onClick={() => handleFilterChange("Assassinats")}
          >
            Assassinats
          </Button>
          <Button
            variant={eventTypeFilter === "Fusillades" ? "default" : "outline"}
            className={
              eventTypeFilter === "Fusillades"
                ? ""
                : "border-gray-300 bg-white text-gray-700"
            }
            onClick={() => handleFilterChange("Fusillades")}
          >
            Fusillades
          </Button>

          {/* Column Visibility & Add Button */}
          <ColumnVisibility
            columns={columnVisibility}
            onVisibilityChange={handleColumnVisibilityChange}
            storageKey="incidents-columns"
          />
          <IncidentForm onSuccess={handleIncidentSuccess} />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-gray-600">Chargement des incidents...</span>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <DataTable<Incident>
          columns={columns}
          data={incidents}
          keyField="id"
          emptyMessage="Aucun incident trouvé"
          pagination={paginationConfig}
          showPagination={!!paginationConfig}
          sortConfig={sortConfig}
          onRowClick={handleRowClick}
        />
      )}

      {/* Edit Incident Dialog */}
      <EditIncidentForm
        incident={editingIncident}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Incident Dialog */}
      <DeleteIncidentDialog
        incident={deletingIncident}
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onSuccess={handleDeleteSuccess}
      />

      {/* Details Dialog */}
      <IncidentDetailsDialog
        incident={incidentToView}
        isOpen={detailsDialogOpen}
        onClose={handleDetailsDialogClose}
      />
    </div>
  );
}

// Define column configuration for visibility control
export const incidentColumnConfig = [
  { key: "eventType", label: "Type", hideable: false },
  { key: "incidentDate", label: "Date Incident", hideable: false },
  { key: "location", label: "Lieu", hideable: false },
  { key: "numberOfVictims", label: "N° de victime", hideable: true },
  { key: "victimsSex", label: "Sexe", hideable: true },
  { key: "victimsCause", label: "Cause du Décès", hideable: true },
  { key: "victimsNames", label: "Noms", hideable: true },
  { key: "createdAt", label: "Date de Création", hideable: false },
  { key: "actions", label: "Actions", hideable: false },
];

// Export the Incident type so it can be used in other files
export type { Incident, Victim };
