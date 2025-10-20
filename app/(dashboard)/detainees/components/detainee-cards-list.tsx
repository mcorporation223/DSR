"use client";

import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { trpc } from "@/components/trpc-provider";
import { DetaineeCard } from "./detainee-card";
import { DetaineeForm } from "./detainee-form";
import { EditDetaineeForm } from "./edit-detainee-form";
import { DeleteDetaineeDialog } from "./delete-detainee-dialog";
import { DetaineeDetailsDialog } from "./detainee-details-dialog";
import type { Detainee } from "./detainee-table";

// Mobile Pagination Component
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
        Affichage de {startItem} à {endItem} sur {totalItems} détenus
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-9 px-3"
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
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="h-9 w-9 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-9 px-3"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}

interface DetaineeCardsListProps {
  className?: string;
}

export function DetaineeCardsList({ className = "" }: DetaineeCardsListProps) {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  // Dialog states
  const [editingDetainee, setEditingDetainee] = useState<Detainee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingDetainee, setDeletingDetainee] = useState<Detainee | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
    sortBy: "createdAt",
    sortOrder: "desc",
    status: statusFilter,
  });

  const detainees = detaineesData?.detainees || [];
  const pagination = detaineesData?.pagination;

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((status: string | undefined) => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  const handleDetaineeSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Edit handlers
  const handleEditDetainee = useCallback((detainee: Detainee) => {
    setEditingDetainee(detainee);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingDetainee(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Delete handlers
  const handleDeleteDetainee = useCallback((detainee: Detainee) => {
    setDeletingDetainee(detainee);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeletingDetainee(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // View handlers
  const handleViewDetainee = useCallback((detainee: Detainee) => {
    setDetaineeToView(detainee);
    setDetailsDialogOpen(true);
  }, []);

  const handleDetailsDialogClose = useCallback(() => {
    setDetailsDialogOpen(false);
    setDetaineeToView(null);
  }, []);

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erreur lors du chargement
          </h3>
          <p className="text-gray-600 mb-4">
            {error?.message || "Une erreur est survenue"}
          </p>
          <Button onClick={() => refetch()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mobile Controls */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Détenus</h1>
          <DetaineeForm onSuccess={handleDetaineeSuccess} />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher des détenus..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange(undefined)}
              className={
                statusFilter === undefined
                  ? ""
                  : "border-gray-300 bg-white text-gray-700"
              }
            >
              <Filter className="w-4 h-4 mr-2" />
              Tous
            </Button>
            <Button
              variant={statusFilter === "in_custody" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("in_custody")}
              className={
                statusFilter === "in_custody"
                  ? ""
                  : "border-gray-300 bg-white text-gray-700"
              }
            >
              En détention
            </Button>
            <Button
              variant={statusFilter === "released" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("released")}
              className={
                statusFilter === "released"
                  ? ""
                  : "border-gray-300 bg-white text-gray-700"
              }
            >
              Libérés
            </Button>
            <Button
              variant={statusFilter === "transferred" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("transferred")}
              className={
                statusFilter === "transferred"
                  ? ""
                  : "border-gray-300 bg-white text-gray-700"
              }
            >
              Transférés
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-gray-600">Chargement des détenus...</span>
          </div>
        </div>
      )}

      {/* Detainees Grid */}
      {!isLoading && (
        <>
          {detainees.length === 0 ? (
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
                  Aucun détenu trouvé
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Aucun détenu ne correspond à votre recherche."
                    : "Commencez par enregistrer votre premier détenu."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {detainees.map((detainee) => (
                <DetaineeCard
                  key={detainee.id}
                  detainee={detainee}
                  onView={handleViewDetainee}
                  onEdit={handleEditDetainee}
                  onDelete={handleDeleteDetainee}
                />
              ))}
            </div>
          )}

          {/* Mobile Pagination */}
          {pagination && pagination.totalPages > 1 && (
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

      {/* Dialogs */}
      <EditDetaineeForm
        detainee={editingDetainee}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onSuccess={handleEditSuccess}
      />

      <DeleteDetaineeDialog
        detainee={deletingDetainee}
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onSuccess={handleDeleteSuccess}
      />

      <DetaineeDetailsDialog
        detainee={detaineeToView}
        isOpen={detailsDialogOpen}
        onClose={handleDetailsDialogClose}
      />
    </div>
  );
}
