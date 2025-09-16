"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  // Download,
  Search,
  Filter,
  Loader2,
  // Edit,
  Trash2,
  FileText,
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
} from "@/components/data-table";
import { useState, useCallback, useMemo } from "react";
import {
  ColumnVisibility,
  type ColumnVisibilityOption,
} from "@/components/column-visibility";
import { trpc } from "@/components/trpc-provider";
import { StatementForm } from "./statement-form";
import { EditStatementForm } from "./edit-statement-form";
import { DeleteStatementDialog } from "./delete-statement-dialog";

// Types for statement data
interface Statement extends Record<string, unknown> {
  id: string;
  fileUrl: string;
  detaineeId: string;
  detaineeName: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdByName: string | null;
  updatedByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function StatementsTable() {
  // All the state that was previously in the page component
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "fileUrl">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [columnVisibility, setColumnVisibility] = useState<
    ColumnVisibilityOption[]
  >(statementColumnConfig.map((col) => ({ ...col, visible: true })));

  // Edit statement state
  const [editingStatement, setEditingStatement] = useState<Statement | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete statement state
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
    sortBy,
    sortOrder,
  });

  const statements =
    statementsData?.statements?.map((statement) => ({
      ...statement,
      createdAt: new Date(statement.createdAt),
      updatedAt: new Date(statement.updatedAt),
    })) || [];
  const pagination = statementsData?.pagination;

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

  // Handle adding new statement
  const handleStatementSuccess = useCallback(() => {
    refetch(); // Refresh the statements list
  }, [refetch]);

  // Handle editing statement
  const handleEditStatement = useCallback((statement: Statement) => {
    setEditingStatement(statement);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingStatement(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    refetch(); // Refresh the statements list
  }, [refetch]);

  // Handle deleting statement
  const handleDeleteStatement = useCallback((statement: Statement) => {
    setDeletingStatement(statement);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeletingStatement(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    refetch(); // Refresh the statements list
  }, [refetch]);

  // Format date for display
  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const allColumns: TableColumn<Statement>[] = [
    {
      key: "detaineeName",
      label: "Détenu",
      className: "w-48 px-4",
      render: (value) => {
        const detaineeName = value as string;
        return (
          <span
            className="text-sm font-medium text-gray-900 truncate block max-w-[180px]"
            title={detaineeName}
          >
            {detaineeName}
          </span>
        );
      },
    },
    {
      key: "fileUrl",
      label: "Déclaration",
      className: "w-40 px-4",
      render: (value) => {
        const fileUrl = value as string;
        return (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span
              className="text-sm font-medium text-blue-600 cursor-pointer hover:underline"
              onClick={() => window.open(fileUrl, "_blank")}
              title="Cliquer pour ouvrir la déclaration"
            >
              Déclaration
            </span>
          </div>
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
      className: "w-32",
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
              {/* <DropdownMenuItem
                onSelect={() => handleEditStatement(record as Statement)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem
                onSelect={() => window.open(record.fileUrl as string, "_blank")}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </DropdownMenuItem> */}
              <DropdownMenuItem
                className="text-red-600"
                onSelect={() => handleDeleteStatement(record as Statement)}
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
          <h1 className="text-2xl font-bold text-gray-900">Déclarations</h1>
        </div>
        <div className="flex items-center gap-3">
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
          <Button
            variant="outline"
            className="border-gray-300 bg-white text-gray-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
          <ColumnVisibility
            columns={columnVisibility}
            onVisibilityChange={handleColumnVisibilityChange}
            storageKey="statements-columns"
          />
          <StatementForm onSuccess={handleStatementSuccess} />
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">
            Chargement des déclarations...
          </span>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <DataTable<Statement>
          columns={columns}
          data={statements}
          keyField="id"
          emptyMessage="Aucune déclaration trouvée"
          pagination={paginationConfig}
          showPagination={!!pagination}
          sortConfig={{
            sortBy,
            sortOrder,
            onSort: handleSort,
          }}
        />
      )}

      {/* Edit Statement Dialog */}
      <EditStatementForm
        statement={editingStatement}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Statement Dialog */}
      <DeleteStatementDialog
        statement={deletingStatement}
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

// Define column configuration for visibility control
export const statementColumnConfig = [
  { key: "detaineeName", label: "Détenu", hideable: false },
  { key: "fileUrl", label: "Déclaration", hideable: false },
  { key: "createdBy", label: "Créé par", hideable: true },
  { key: "updatedBy", label: "Modifié par", hideable: true },
  { key: "createdAt", label: "Date de Création", hideable: true },
  { key: "updatedAt", label: "Date de Modification", hideable: true },
  { key: "actions", label: "Actions", hideable: false },
];

// Export the Statement type so it can be used in other files
export type { Statement };
