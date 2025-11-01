"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Activity,
  FileText,
} from "lucide-react";
import { trpc } from "@/components/trpc-provider";
import { AuditLogCard } from "./audit-log-card";
import { AuditLogDetailsDialog } from "./audit-log-details-dialog";
import { type AuditLog } from "./audit-logs-table";

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

export function AuditLogCardsList() {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<
    "create" | "update" | "delete" | "status_change" | undefined
  >(undefined);
  const [entityTypeFilter, setEntityTypeFilter] = useState<
    | "employee"
    | "detainee"
    | "report"
    | "statement"
    | "incident"
    | "seizure"
    | "user"
    | undefined
  >(undefined);

  // Dialog states
  const [viewingLog, setViewingLog] = useState<AuditLog | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const itemsPerPage = 10;

  // TRPC query
  const {
    data: auditLogsData,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.auditLogs.getAll.useQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
    action: actionFilter,
    entityType: entityTypeFilter,
  });

  const auditLogs = (auditLogsData?.data || []) as AuditLog[];
  const pagination = auditLogsData?.pagination;

  // Event handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleActionFilterChange = useCallback(
    (action: typeof actionFilter) => {
      setActionFilter(action);
      setCurrentPage(1);
    },
    []
  );

  const handleEntityTypeFilterChange = useCallback(
    (entityType: typeof entityTypeFilter) => {
      setEntityTypeFilter(entityType);
      setCurrentPage(1);
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // View handlers
  const handleViewLog = useCallback((log: AuditLog) => {
    setViewingLog(log);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleDetailsDialogClose = useCallback(() => {
    setIsDetailsDialogOpen(false);
    setViewingLog(null);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Journaux d&apos;audit
        </h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Rechercher dans les journaux..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Action Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={actionFilter === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => handleActionFilterChange(undefined)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Toutes actions
        </Button>
        <Button
          variant={actionFilter === "create" ? "default" : "outline"}
          size="sm"
          onClick={() => handleActionFilterChange("create")}
        >
          Création
        </Button>
        <Button
          variant={actionFilter === "update" ? "default" : "outline"}
          size="sm"
          onClick={() => handleActionFilterChange("update")}
        >
          Modification
        </Button>
        <Button
          variant={actionFilter === "delete" ? "default" : "outline"}
          size="sm"
          onClick={() => handleActionFilterChange("delete")}
        >
          Suppression
        </Button>
        <Button
          variant={actionFilter === "status_change" ? "default" : "outline"}
          size="sm"
          onClick={() => handleActionFilterChange("status_change")}
        >
          Changement statut
        </Button>
      </div>

      {/* Entity Type Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={entityTypeFilter === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => handleEntityTypeFilterChange(undefined)}
        >
          <FileText className="w-4 h-4 mr-2" />
          Tous types
        </Button>
        <Button
          variant={entityTypeFilter === "employee" ? "default" : "outline"}
          size="sm"
          onClick={() => handleEntityTypeFilterChange("employee")}
        >
          Employé
        </Button>
        <Button
          variant={entityTypeFilter === "detainee" ? "default" : "outline"}
          size="sm"
          onClick={() => handleEntityTypeFilterChange("detainee")}
        >
          Détenu
        </Button>
        <Button
          variant={entityTypeFilter === "report" ? "default" : "outline"}
          size="sm"
          onClick={() => handleEntityTypeFilterChange("report")}
        >
          Rapport
        </Button>
        <Button
          variant={entityTypeFilter === "statement" ? "default" : "outline"}
          size="sm"
          onClick={() => handleEntityTypeFilterChange("statement")}
        >
          Déclaration
        </Button>
        <Button
          variant={entityTypeFilter === "incident" ? "default" : "outline"}
          size="sm"
          onClick={() => handleEntityTypeFilterChange("incident")}
        >
          Incident
        </Button>
        <Button
          variant={entityTypeFilter === "seizure" ? "default" : "outline"}
          size="sm"
          onClick={() => handleEntityTypeFilterChange("seizure")}
        >
          Saisie
        </Button>
        <Button
          variant={entityTypeFilter === "user" ? "default" : "outline"}
          size="sm"
          onClick={() => handleEntityTypeFilterChange("user")}
        >
          Utilisateur
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-gray-600">
              Chargement des journaux d&apos;audit...
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <>
          {/* Audit Logs Grid */}
          {auditLogs.length > 0 ? (
            <div className="grid gap-4">
              {auditLogs.map((log) => (
                <AuditLogCard key={log.id} log={log} onView={handleViewLog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || actionFilter || entityTypeFilter
                  ? "Aucun journal ne correspond à vos critères de recherche."
                  : "Aucun journal d'audit enregistré pour le moment."}
              </p>
            </div>
          )}

          {/* Mobile Pagination */}
          {!isLoading && pagination && pagination.totalPages > 1 && (
            <MobilePagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalCount}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Dialogs */}
      <AuditLogDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={handleDetailsDialogClose}
        log={viewingLog}
      />
    </div>
  );
}
