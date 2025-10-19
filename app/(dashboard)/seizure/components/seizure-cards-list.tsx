"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import { trpc } from "@/components/trpc-provider";
import { SeizureCard } from "./seizure-card";
import { SeizureForm } from "./seizure-form";
import { EditSeizureForm } from "./edit-seizure-form";
import { DeleteSeizureDialog } from "./delete-seizure-dialog";
import { SeizureDetailsDialog } from "./seizure-details-dialog";
import type { Seizure } from "./seizure-table";

interface PaginationInfo {
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export function SeizureCardsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

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
    sortBy: "createdAt",
    sortOrder: "desc",
    type: typeFilter,
    status: statusFilter,
  });

  const seizures = useMemo(() => {
    return (
      seizuresData?.seizures?.map((seizure) => ({
        ...seizure,
        seizureDate: new Date(seizure.seizureDate),
        releaseDate: seizure.releaseDate ? new Date(seizure.releaseDate) : null,
        createdAt: new Date(seizure.createdAt),
        updatedAt: new Date(seizure.updatedAt),
      })) || []
    );
  }, [seizuresData]);

  const pagination: PaginationInfo | undefined = seizuresData?.pagination;

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleTypeFilter = useCallback((type: string | undefined) => {
    setTypeFilter(type);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((status: string | undefined) => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  const handleSeizureSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEditSeizure = useCallback((seizure: Seizure) => {
    setEditingSeizure(seizure);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingSeizure(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDeleteSeizure = useCallback((seizure: Seizure) => {
    setDeletingSeizure(seizure);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeletingSeizure(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleViewSeizure = useCallback((seizure: Seizure) => {
    setViewingSeizure(seizure);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleDetailsDialogClose = useCallback(() => {
    setIsDetailsDialogOpen(false);
    setViewingSeizure(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Saisies</h1>
          <SeizureForm onSuccess={handleSeizureSuccess} />
        </div>

        {/* Mobile Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher des saisies..."
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
            size="sm"
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
            size="sm"
            className={
              typeFilter === "Moto"
                ? ""
                : "border-gray-300 bg-white text-gray-700"
            }
            onClick={() => handleTypeFilter("Moto")}
          >
            Motos
          </Button>
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

      {/* Seizures Cards */}
      {!isLoading && seizures.length > 0 && (
        <div className="grid gap-4">
          {seizures.map((seizure) => (
            <SeizureCard
              key={seizure.id}
              seizure={seizure}
              onEdit={handleEditSeizure}
              onDelete={handleDeleteSeizure}
              onView={handleViewSeizure}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && seizures.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Aucune saisie trouvée</p>
          {searchTerm || typeFilter || statusFilter ? (
            <p className="text-gray-400 text-sm">
              Essayez de modifier vos critères de recherche ou de filtrage
            </p>
          ) : (
            <p className="text-gray-400 text-sm">
              Commencez par ajouter votre première saisie
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-600">
            Page {pagination.page} sur {pagination.totalPages} (
            {pagination.totalItems} saisies)
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
