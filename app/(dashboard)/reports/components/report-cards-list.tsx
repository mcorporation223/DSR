"use client";

import { ReportCard } from "./report-card";
import type { Report } from "./reports-table";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useState, useCallback } from "react";
import { trpc } from "@/components/trpc-provider";
import { ReportForm } from "./report-form";
import { EditReportForm } from "./edit-report-form";
import { DeleteReportDialog } from "./delete-report-dialog";
import { ReportDetailsDialog } from "./report-details-dialog";

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

interface ReportCardsListProps {
  emptyMessage?: string;
}

export function ReportCardsList({
  emptyMessage = "Aucun rapport trouvé",
}: ReportCardsListProps) {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"reportDate" | "title" | "createdAt">(
    "reportDate"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState<Report | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [reportToView, setReportToView] = useState<Report | null>(null);

  const itemsPerPage = 10;

  // TRPC query for reports
  const {
    data: reportsData,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.reports.getAll.useQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    sortBy,
    sortOrder,
  });

  const reports =
    reportsData?.reports?.map((report) => ({
      ...report,
      reportDate: new Date(report.reportDate),
      createdAt: new Date(report.createdAt),
      updatedAt: new Date(report.updatedAt),
    })) || [];
  const pagination = reportsData?.pagination;

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
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

  const handleReportSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEditReport = useCallback((report: Report) => {
    setReportToEdit(report);
    setEditDialogOpen(true);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setEditDialogOpen(false);
    setReportToEdit(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    refetch();
    handleEditDialogClose();
  }, [refetch, handleEditDialogClose]);

  const handleDeleteReport = useCallback((report: Report) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refetch();
    handleDeleteDialogClose();
  }, [refetch, handleDeleteDialogClose]);

  const handleViewReport = useCallback((report: Report) => {
    setReportToView(report);
    setDetailsDialogOpen(true);
  }, []);

  const handleDetailsDialogClose = useCallback(() => {
    setDetailsDialogOpen(false);
    setReportToView(null);
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
          <h1 className="text-xl font-bold text-gray-900">Rapports</h1>
          <ReportForm onSuccess={handleReportSuccess} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un rapport..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
          />
        </div>

        {/* Sort Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={sortBy === "reportDate" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSortChange("reportDate")}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Par date de rapport
            {sortBy === "reportDate" && (
              <span className="text-xs">
                {sortOrder === "desc" ? "↓" : "↑"}
              </span>
            )}
          </Button>
          <Button
            variant={sortBy === "title" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSortChange("title")}
          >
            Par titre
            {sortBy === "title" && (
              <span className="text-xs">
                {sortOrder === "desc" ? "↓" : "↑"}
              </span>
            )}
          </Button>
          <Button
            variant={sortBy === "createdAt" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSortChange("createdAt")}
          >
            Par création
            {sortBy === "createdAt" && (
              <span className="text-xs">
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
            <span className="text-gray-600">Chargement des rapports...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && reports.length === 0 && (
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
              Aucun rapport
            </h3>
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        </div>
      )}

      {/* Cards List */}
      {!isLoading && reports.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onView={handleViewReport}
              onEdit={handleEditReport}
              onDelete={handleDeleteReport}
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

      {/* Edit Report Dialog */}
      <EditReportForm
        report={reportToEdit}
        isOpen={editDialogOpen}
        onClose={handleEditDialogClose}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Dialog */}
      <DeleteReportDialog
        report={reportToDelete}
        isOpen={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onSuccess={handleDeleteSuccess}
      />

      {/* Details Dialog */}
      <ReportDetailsDialog
        report={reportToView}
        isOpen={detailsDialogOpen}
        onClose={handleDetailsDialogClose}
      />
    </div>
  );
}
