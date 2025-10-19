"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import { trpc } from "@/components/trpc-provider";
import { IncidentCard } from "./incident-card";
import { IncidentForm } from "./incident-form";
import { EditIncidentForm } from "./edit-incident-form";
import { DeleteIncidentDialog } from "./delete-incident-dialog";
import { IncidentDetailsDialog } from "./incident-details-dialog";
import type { Incident } from "./incident-table";

interface PaginationInfo {
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export function IncidentCardsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string | undefined>(
    undefined
  );

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
    sortBy: "createdAt",
    sortOrder: "desc",
    eventType: eventTypeFilter,
  });

  const incidents = useMemo(() => {
    return (
      incidentsData?.incidents?.map((incident) => ({
        ...incident,
        incidentDate: new Date(incident.incidentDate),
        createdAt: new Date(incident.createdAt),
        updatedAt: new Date(incident.updatedAt),
        victims: incident.victims.map((victim) => ({
          ...victim,
          sex: victim.sex as "Male" | "Female",
        })),
      })) || []
    );
  }, [incidentsData]);

  const pagination: PaginationInfo | undefined = incidentsData?.pagination;

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((eventType: string | undefined) => {
    setEventTypeFilter(eventType);
    setCurrentPage(1);
  }, []);

  const handleIncidentSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEditIncident = useCallback((incident: Incident) => {
    setEditingIncident(incident);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingIncident(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDeleteIncident = useCallback((incident: Incident) => {
    setDeletingIncident(incident);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeletingIncident(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

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
      {/* Mobile Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <IncidentForm onSuccess={handleIncidentSuccess} />
        </div>

        {/* Mobile Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher des incidents..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
          />
        </div>

        {/* Mobile Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 bg-white text-gray-700"
            onClick={() => handleFilterChange(undefined)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Tous
          </Button>
          <Button
            variant={eventTypeFilter === "Assassinats" ? "default" : "outline"}
            size="sm"
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
            size="sm"
            className={
              eventTypeFilter === "Fusillades"
                ? ""
                : "border-gray-300 bg-white text-gray-700"
            }
            onClick={() => handleFilterChange("Fusillades")}
          >
            Fusillades
          </Button>
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

      {/* Incidents Cards */}
      {!isLoading && incidents.length > 0 && (
        <div className="grid gap-4">
          {incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onEdit={handleEditIncident}
              onDelete={handleDeleteIncident}
              onView={handleViewIncident}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && incidents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Aucun incident trouvé</p>
          {searchTerm || eventTypeFilter ? (
            <p className="text-gray-400 text-sm">
              Essayez de modifier vos critères de recherche ou de filtrage
            </p>
          ) : (
            <p className="text-gray-400 text-sm">
              Commencez par ajouter votre premier incident
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-600">
            Page {pagination.page} sur {pagination.totalPages} (
            {pagination.totalItems} incidents)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setCurrentPage(pagination.page - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setCurrentPage(pagination.page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
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
