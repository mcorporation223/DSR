"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  Eye,
  Inbox,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { TableSkeleton } from "@/components/table-skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
} from "@/components/data-table";
import { useState, useCallback, useMemo } from "react";
import {
  ColumnVisibility,
  type ColumnVisibilityOption,
} from "@/components/column-visibility";
import { trpc } from "@/components/trpc-provider";
import { ReportForm } from "./report-form";
import { EditReportForm } from "./edit-report-form";
import { DeleteReportDialog } from "./delete-report-dialog";
import { ReportDetailsDialog } from "./report-details-dialog";

// Types for report data
interface Report extends Record<string, unknown> {
  id: string;
  title: string;
  content: string | null;
  location: string | null;
  reportDate: Date;
  createdBy: string | null;
  updatedBy: string | null;
  createdByName: string | null;
  updatedByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function ReportsTable() {
  // All the state that was previously in the page component
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"reportDate" | "title" | "createdAt">(
    "reportDate"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [columnVisibility, setColumnVisibility] = useState<
    ColumnVisibilityOption[]
  >(reportColumnConfig.map((col) => ({ ...col, visible: true })));

  // Edit report state
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete report state
  const [deletingReport, setDeletingReport] = useState<Report | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Details report state
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

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
    searchDate: searchDate ? searchDate.toISOString().split("T")[0] : undefined,
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

  const handleDateSearch = useCallback((date: Date | undefined) => {
    setSearchDate(date);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSearchDate(undefined);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = searchTerm || searchDate;

  // Format date for display in the date picker trigger
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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

  const visibleColumnKeys = columnVisibility
    .filter((col) => col.visible)
    .map((col) => col.key);

  // Handle adding new report
  const handleReportSuccess = useCallback(() => {
    refetch(); // Refresh the reports list
  }, [refetch]);

  // Handle editing report
  const handleEditReport = useCallback((report: Report) => {
    setEditingReport(report);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingReport(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    refetch(); // Refresh the reports list
  }, [refetch]);

  // Handle deleting report
  const handleDeleteReport = useCallback((report: Report) => {
    setDeletingReport(report);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeletingReport(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refetch(); // Refresh the reports list
  }, [refetch]);

  // Handle viewing report details
  const handleViewReport = useCallback((report: Report) => {
    setViewingReport(report);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleDetailsDialogClose = useCallback(() => {
    setIsDetailsDialogOpen(false);
    setViewingReport(null);
  }, []);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const allColumns: TableColumn<Report>[] = [
    {
      key: "title",
      label: "Titre",
      className: "w-48 px-4",
      render: (value) => {
        const title = value as string;
        return (
          <span
            className="text-sm font-medium text-gray-900 truncate block max-w-[180px]"
            title={title}
          >
            {title}
          </span>
        );
      },
    },
    {
      key: "reportDate",
      label: "Date Rapport",
      className: "w-28",
      render: (value) => (
        <span className="text-sm text-gray-900">
          {formatDate(value as Date)}
        </span>
      ),
    },
    {
      key: "location",
      label: "Lieu",
      className: "w-32",
      render: (value) => {
        const location = value as string | null;
        return (
          <span
            className="text-sm text-gray-600 truncate block max-w-[120px]"
            title={location || ""}
          >
            {location || "N/A"}
          </span>
        );
      },
    },
    {
      key: "content",
      label: "Contenu",
      className: "w-48",
      render: (value) => {
        const content = value as string | null;
        if (!content) return <span className="text-sm text-gray-500">N/A</span>;

        // Strip HTML tags for plain text version (for title attribute)
        const stripHtml = (html: string) => {
          const doc = new DOMParser().parseFromString(html, "text/html");
          return doc.body.textContent || "";
        };

        const plainText = stripHtml(content);

        // For display, we'll render HTML but truncated
        const truncatedHtml =
          content.length > 80 ? content.substring(0, 80) + "..." : content;

        return (
          <div
            className="text-sm text-gray-900 max-w-[180px] overflow-hidden line-clamp-2 leading-tight"
            title={plainText}
            dangerouslySetInnerHTML={{ __html: truncatedHtml }}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          />
        );
      },
    },
    {
      key: "createdBy",
      label: "Créé par",
      className: "w-32",
      render: (value, record) => (
        <span
          className="text-sm text-gray-600 truncate block max-w-[120px]"
          title={record.createdByName as string}
        >
          {(record.createdByName as string) || "N/A"}
        </span>
      ),
    },
    {
      key: "updatedBy",
      label: "Modifié par",
      className: "w-32",
      render: (value, record) => (
        <span
          className="text-sm text-gray-600 truncate block max-w-[120px]"
          title={record.updatedByName as string}
        >
          {(record.updatedByName as string) || "N/A"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date de Création",
      className: "min-w-[160px]",
      render: (value) => (
        <span className="text-sm text-gray-600">
          {formatDateTime(value as Date)}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "Date de Modification",
      className: "w-40",
      render: (value) => (
        <span className="text-sm text-gray-600">
          {formatDateTime(value as Date)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "w-24",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => handleViewReport(record as Report)}
          >
            <Eye className="w-4 h-4" />
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={() => handleEditReport(record as Report)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onSelect={() => handleDeleteReport(record as Report)}
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

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-lg font-medium">Erreur lors du chargement</p>
        <p className="text-sm">{error?.message}</p>
        <Button onClick={() => refetch()} className="mt-4" variant="outline">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par titre, contenu..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm w-64"
              />
            </div>

            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-48 justify-start text-left font-normal border-gray-300 bg-white text-gray-700 ${
                    !searchDate && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchDate ? (
                    formatDateForDisplay(searchDate)
                  ) : (
                    <span>Filtrer par date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={searchDate}
                  onSelect={handleDateSearch}
                  disabled={(date) =>
                    date > new Date() || date < new Date("2020-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 px-2 text-gray-500 hover:text-gray-700"
                title="Effacer les filtres"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {/* <Button
            variant="outline"
            className="border-gray-300 bg-white text-gray-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button> */}
          <ColumnVisibility
            columns={columnVisibility}
            onVisibilityChange={handleColumnVisibilityChange}
            storageKey="reports-columns"
          />
          <ReportForm onSuccess={handleReportSuccess} />
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <TableSkeleton
          rows={6}
          columns={5}
          showAvatar={false}
          showStatusBadge={false}
          showActions={true}
          showPagination={true}
          columnWidths={["w-32", "w-20", "w-24", "w-40", "w-16"]}
        />
      )}

      {/* Table */}
      {!isLoading && (
        <DataTable<Report>
          columns={columns}
          data={reports}
          keyField="id"
          emptyState={
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun rapport trouvé
              </h3>
              <p className="text-sm text-gray-500 max-w-sm text-center">
                {hasActiveFilters
                  ? "Aucun rapport ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                  : "Commencez par créer le premier rapport dans le système."}
              </p>
            </div>
          }
          pagination={paginationConfig}
          showPagination={!!pagination}
          sortConfig={{
            sortBy,
            sortOrder,
            onSort: handleSort,
          }}
          onRowClick={handleViewReport}
        />
      )}

      {/* Edit Report Dialog */}
      <EditReportForm
        report={editingReport}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Report Dialog */}
      <DeleteReportDialog
        report={deletingReport}
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onSuccess={handleDeleteSuccess}
      />

      {/* Report Details Dialog */}
      <ReportDetailsDialog
        report={viewingReport}
        isOpen={isDetailsDialogOpen}
        onClose={handleDetailsDialogClose}
      />
    </div>
  );
}

// Define column configuration for visibility control
export const reportColumnConfig = [
  { key: "title", label: "Titre", hideable: false },
  { key: "reportDate", label: "Date Rapport", hideable: false },
  { key: "location", label: "Lieu", hideable: true },
  { key: "content", label: "Contenu", hideable: false },
  { key: "createdBy", label: "Créé par", hideable: true },
  { key: "updatedBy", label: "Modifié par", hideable: true },
  { key: "createdAt", label: "Date de Création", hideable: true },
  { key: "updatedAt", label: "Date de Modification", hideable: true },
  { key: "actions", label: "Actions", hideable: false },
];

// Export the Report type so it can be used in other files
export type { Report };
