"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Car,
  Bike,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

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
import { trpc } from "@/components/trpc-provider";
import { SeizureCard } from "./seizure-card";
import { SeizureForm } from "./seizure-form";
import { EditSeizureForm } from "./edit-seizure-form";
import { DeleteSeizureDialog } from "./delete-seizure-dialog";
import { SeizureDetailsDialog } from "./seizure-details-dialog";
import { type Seizure } from "./seizure-table";

export function SeizureCardsList() {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "vehicule" | "objet" | undefined
  >(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  // Dialog states
  const [editingSeizure, setEditingSeizure] = useState<Seizure | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingSeizure, setDeletingSeizure] = useState<Seizure | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewingSeizure, setViewingSeizure] = useState<Seizure | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const itemsPerPage = 10;

  // TRPC query
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
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
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

  // Event handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleTypeFilter = useCallback(
    (type: "vehicule" | "objet" | undefined) => {
      setTypeFilter(type);
      setCurrentPage(1);
    },
    []
  );

  const handleStatusFilter = useCallback((status: string | undefined) => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  const handleSeizureSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Edit handlers
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

  // Delete handlers
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

  // View handlers
  const handleViewSeizure = useCallback((seizure: Seizure) => {
    setViewingSeizure(seizure);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleDetailsDialogClose = useCallback(() => {
    setIsDetailsDialogOpen(false);
    setViewingSeizure(null);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Saisies</h1>
        <SeizureForm onSuccess={handleSeizureSuccess} />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Rechercher des saisies..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={typeFilter === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => handleTypeFilter(undefined)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Tous types
        </Button>
        <Button
          variant={typeFilter === "vehicule" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTypeFilter("vehicule")}
        >
          <Car className="w-4 h-4 mr-2" />
          Véhicules
        </Button>
        <Button
          variant={typeFilter === "objet" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTypeFilter("objet")}
        >
          <Bike className="w-4 h-4 mr-2" />
          Objets
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusFilter(undefined)}
        >
          Tous statuts
        </Button>
        <Button
          variant={statusFilter === "in_custody" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusFilter("in_custody")}
        >
          En garde
        </Button>
        <Button
          variant={statusFilter === "released" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusFilter("released")}
        >
          Libéré
        </Button>
        <Button
          variant={statusFilter === "disposed" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusFilter("disposed")}
        >
          Disposé
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Spinner className="w-4 h-4" />
            <span className="text-gray-600">Chargement des saisies...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <>
          {/* Results Count */}
          <div className="text-sm text-gray-600">
            {pagination?.totalItems ? (
              <>
                {pagination.totalItems === 1
                  ? "1 saisie trouvée"
                  : `${pagination.totalItems} saisies trouvées`}
                {searchTerm && ` pour "${searchTerm}"`}
              </>
            ) : (
              "Aucune saisie trouvée"
            )}
          </div>

          {/* Seizures Grid */}
          {seizures.length > 0 ? (
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm || typeFilter || statusFilter
                  ? "Aucune saisie ne correspond à vos critères de recherche."
                  : "Aucune saisie enregistrée pour le moment."}
              </p>
            </div>
          )}

          {/* Mobile Pagination */}
          {!isLoading && pagination && pagination.totalPages > 1 && (
            <MobilePagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Dialogs */}
      <EditSeizureForm
        seizure={editingSeizure}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onSuccess={handleEditSuccess}
      />

      <DeleteSeizureDialog
        seizure={deletingSeizure}
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onSuccess={handleDeleteSuccess}
      />

      <SeizureDetailsDialog
        seizure={viewingSeizure}
        isOpen={isDetailsDialogOpen}
        onClose={handleDetailsDialogClose}
      />
    </div>
  );
}
