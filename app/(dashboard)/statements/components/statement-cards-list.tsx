"use client";

import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { trpc } from "@/components/trpc-provider";
import { StatementCard } from "./statement-card";
import { StatementForm } from "./statement-form";
import { EditStatementForm } from "./edit-statement-form";
import { DeleteStatementDialog } from "./delete-statement-dialog";
import type { Statement } from "./statements-table";

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
        Affichage de {startItem} à {endItem} sur {totalItems} déclarations
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

interface StatementCardsListProps {
  className?: string;
}

export function StatementCardsList({
  className = "",
}: StatementCardsListProps) {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog states
  const [editingStatement, setEditingStatement] = useState<Statement | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingStatement, setDeletingStatement] = useState<Statement | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const itemsPerPage = 10;

  // TRPC query for statements
  const {
    data: statementsData,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.statements.getAll.useQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const statements = useMemo(
    () =>
      statementsData?.statements?.map((statement) => ({
        ...statement,
        createdAt: new Date(statement.createdAt),
        updatedAt: new Date(statement.updatedAt),
      })) || [],
    [statementsData?.statements]
  );

  const pagination = statementsData?.pagination;

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleStatementSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Edit handlers
  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingStatement(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Delete handlers
  const handleDeleteStatement = useCallback((statement: Statement) => {
    setDeletingStatement(statement);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeletingStatement(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

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
        <div className="flex justify-between sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Déclarations</h1>
          <StatementForm onSuccess={handleStatementSuccess} />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher des déclarations..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            />
          </div>
          <Button
            variant="outline"
            className="border-gray-300 bg-white text-gray-700 whitespace-nowrap"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-gray-600">
              Chargement des déclarations...
            </span>
          </div>
        </div>
      )}

      {/* Statements Grid */}
      {!isLoading && (
        <>
          {statements.length === 0 ? (
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune déclaration trouvée
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Aucune déclaration ne correspond à votre recherche."
                    : "Commencez par créer votre première déclaration."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {statements.map((statement) => (
                <StatementCard
                  key={statement.id}
                  statement={statement}
                  onDelete={handleDeleteStatement}
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
      <EditStatementForm
        statement={editingStatement}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onSuccess={handleEditSuccess}
      />

      <DeleteStatementDialog
        statement={deletingStatement}
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
