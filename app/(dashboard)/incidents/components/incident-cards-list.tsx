"use client";

import { IncidentCard } from "./incident-card";
import type { Incident } from "./incident-table";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useState, useCallback } from "react";
import { trpc } from "@/components/trpc-provider";
import { IncidentForm } from "./incident-form";
import { EditIncidentForm } from "./edit-incident-form";
import { DeleteIncidentDialog } from "./delete-incident-dialog";
import { IncidentDetailsDialog } from "./incident-details-dialog";

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
          className="w-10 h-10 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
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
          className="w-10 h-10 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

interface IncidentCardsListProps {
  emptyMessage?: string;
}

export function IncidentCardsList({
  emptyMessage = "Aucun incident trouvé",
}: IncidentCardsListProps) {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "incidentDate" | "location" | "eventType" | "createdAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [eventTypeFilter, setEventTypeFilter] = useState<string | undefined>(
    undefined
  );

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [incidentToEdit, setIncidentToEdit] = useState<Incident | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(
    null
  );
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

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((eventType: string | undefined) => {
    setEventTypeFilter(eventType);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback(
    (newSortBy: typeof sortBy) => {
      if (newSortBy === sortBy) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(newSortBy);
        setSortOrder("desc");
      }
      setCurrentPage(1);
    },
    [sortBy]
  );

  const handleIncidentSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEditIncident = useCallback((incident: Incident) => {
    setIncidentToEdit(incident);
    setEditDialogOpen(true);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setEditDialogOpen(false);
    setIncidentToEdit(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    refetch();
    handleEditDialogClose();
  }, [refetch, handleEditDialogClose]);

  const handleDeleteIncident = useCallback((incident: Incident) => {
    setIncidentToDelete(incident);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setIncidentToDelete(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refetch();
    handleDeleteDialogClose();
  }, [refetch, handleDeleteDialogClose]);

  const handleViewIncident = useCallback((incident: Incident) => {
    setIncidentToView(incident);
    setDetailsDialogOpen(true);
  }, []);

  const handleDetailsDialogClose = useCallback(() => {
    setDetailsDialogOpen(false);
    setIncidentToView(null);
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
          <h1 className="text-xl font-bold text-gray-900">Incidents</h1>
          <IncidentForm onSuccess={handleIncidentSuccess} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un incident..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
          />
        </div>

        {/* Event Type Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={eventTypeFilter === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(undefined)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Tous les types
          </Button>
          <Button
            variant={eventTypeFilter === "Assassinats" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("Assassinats")}
          >
            Assassinats
          </Button>
          <Button
            variant={eventTypeFilter === "Fusillades" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("Fusillades")}
          >
            Fusillades
          </Button>
        </div>

        {/* Sort Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={sortBy === "createdAt" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSortChange("createdAt")}
          >
            Par enregistrement
            {sortBy === "createdAt" && (
              <span className="text-xs ml-1">
                {sortOrder === "desc" ? "↓" : "↑"}
              </span>
            )}
          </Button>
          <Button
            variant={sortBy === "incidentDate" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSortChange("incidentDate")}
          >
            Par date incident
            {sortBy === "incidentDate" && (
              <span className="text-xs ml-1">
                {sortOrder === "desc" ? "↓" : "↑"}
              </span>
            )}
          </Button>
          <Button
            variant={sortBy === "location" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSortChange("location")}
          >
            Par lieu
            {sortBy === "location" && (
              <span className="text-xs ml-1">
                {sortOrder === "desc" ? "↓" : "↑"}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Spinner className="w-5 h-5" />
            <span className="text-gray-600">Chargement des incidents...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && incidents.length === 0 && (
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun incident
            </h3>
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        </div>
      )}

      {/* Cards List */}
      {!isLoading && incidents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onView={handleViewIncident}
              onEdit={handleEditIncident}
              onDelete={handleDeleteIncident}
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

      {/* Edit Incident Dialog */}
      <EditIncidentForm
        incident={incidentToEdit}
        isOpen={editDialogOpen}
        onClose={handleEditDialogClose}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Dialog */}
      <DeleteIncidentDialog
        incident={incidentToDelete}
        isOpen={deleteDialogOpen}
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
