"use client";

import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DataTable,
  TableColumn,
  PaginationConfig,
  SortConfig,
} from "@/components/data-table";
import { useState, useCallback, useMemo } from "react";
import {
  ColumnVisibility,
  type ColumnVisibilityOption,
} from "@/components/column-visibility";
import { trpc } from "@/components/trpc-provider";
import { Input } from "@/components/ui/input";
import { AuditLogDetailsDialog } from "./audit-log-details-dialog";

// Types for audit log data
interface AuditLog extends Record<string, unknown> {
  id: number;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  createdAt: string;
  userFirstName: string | null;
  userLastName: string | null;
  userEmail: string | null;
  userRole: string | null;
}

export function AuditLogsTable() {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "action" | "entityType" | "userId"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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
  const [columnVisibility, setColumnVisibility] = useState<
    ColumnVisibilityOption[]
  >(auditLogColumnConfig.map((col) => ({ ...col, visible: true })));
  const [viewingLog, setViewingLog] = useState<AuditLog | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const itemsPerPage = 10;

  // TRPC query for audit logs
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
    sortBy,
    sortOrder,
    action: actionFilter,
    entityType: entityTypeFilter,
  });

  const auditLogs = auditLogsData?.data || [];
  const pagination = auditLogsData?.pagination;

  // Handlers
  const handleColumnVisibilityChange = useCallback(
    (columns: ColumnVisibilityOption[]) => {
      setColumnVisibility(columns);
    },
    []
  );

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

  const handleSort = useCallback(
    (columnKey: string) => {
      if (columnKey === sortBy) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(columnKey as typeof sortBy);
        setSortOrder("desc");
      }
      setCurrentPage(1);
    },
    [sortBy]
  );

  const paginationConfig: PaginationConfig = useMemo(
    () => ({
      currentPage: pagination?.page || 1,
      totalPages: pagination?.totalPages || 1,
      totalItems: pagination?.totalCount || 0,
      itemsPerPage: pagination?.limit || itemsPerPage,
      onPageChange: setCurrentPage,
    }),
    [pagination]
  );

  const sortConfig: SortConfig = useMemo(
    () => ({
      sortBy,
      sortOrder,
      onSort: handleSort,
    }),
    [sortBy, sortOrder, handleSort]
  );

  const visibleColumnKeys = columnVisibility
    .filter((col) => col.visible)
    .map((col) => col.key);

  // Handle view audit log
  const handleViewLog = useCallback((log: AuditLog) => {
    setViewingLog(log);
    setIsDetailsDialogOpen(true);
  }, []);

  // Handle row click
  const handleRowClick = useCallback(
    (log: AuditLog) => {
      handleViewLog(log);
    },
    [handleViewLog]
  );

  // Get action display info
  const getActionDisplay = (action: string) => {
    switch (action) {
      case "create":
        return { text: "Création", color: "bg-green-500" };
      case "update":
        return { text: "Modification", color: "bg-blue-500" };
      case "delete":
        return { text: "Suppression", color: "bg-red-500" };
      case "status_change":
        return { text: "Changement statut", color: "bg-orange-500" };
      default:
        return { text: action, color: "bg-gray-500" };
    }
  };

  // Get entity type display info
  const getEntityTypeDisplay = (entityType: string) => {
    switch (entityType) {
      case "employee":
        return { text: "Employé", color: "bg-blue-500" };
      case "detainee":
        return { text: "Détenu", color: "bg-red-500" };
      case "report":
        return { text: "Rapport", color: "bg-green-500" };
      case "statement":
        return { text: "Déclaration", color: "bg-purple-500" };
      case "incident":
        return { text: "Incident", color: "bg-orange-500" };
      case "seizure":
        return { text: "Saisie", color: "bg-yellow-500" };
      case "user":
        return { text: "Utilisateur", color: "bg-indigo-500" };
      default:
        return { text: entityType, color: "bg-gray-500" };
    }
  };

  const allColumns: TableColumn<AuditLog>[] = [
    {
      key: "createdAt",
      label: "Date & Heure",
      className: "w-48",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-900">
          <div>{new Date(value as string).toLocaleDateString("fr-FR")}</div>
          <div className="text-xs text-gray-500">
            {new Date(value as string).toLocaleTimeString("fr-FR")}
          </div>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      className: "w-36",
      sortable: true,
      render: (value) => {
        const actionInfo = getActionDisplay(value as string);
        return (
          <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max">
            <div className={`w-3 h-3 rounded-full ${actionInfo.color}`} />
            <span className="text-sm font-medium text-gray-900">
              {actionInfo.text}
            </span>
          </div>
        );
      },
    },
    {
      key: "entityType",
      label: "Type d'entité",
      className: "w-36",
      sortable: true,
      render: (value) => {
        const entityInfo = getEntityTypeDisplay(value as string);
        return (
          <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max">
            <div className={`w-3 h-3 rounded-full ${entityInfo.color}`} />
            <span className="text-sm font-medium text-gray-900">
              {entityInfo.text}
            </span>
          </div>
        );
      },
    },
    {
      key: "entityId",
      label: "ID Entité",
      className: "w-32",
      render: (value) => (
        <span className="text-sm text-gray-900 font-mono">
          {(value as string).substring(0, 8)}...
        </span>
      ),
    },
    {
      key: "userFirstName",
      label: "Utilisateur",
      className: "w-48",
      sortable: true,
      render: (value, log) => {
        const fullName = `${log.userFirstName || ""} ${
          log.userLastName || ""
        }`.trim();
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {fullName || "N/A"}
            </span>
            <span
              className="text-xs text-gray-500"
              title={log.userEmail || undefined}
            >
              {log.userEmail}
            </span>
          </div>
        );
      },
    },
    {
      key: "details",
      label: "Détails",
      className: "w-48",
      render: (value) => {
        if (!value) return <span className="text-gray-400">-</span>;
        const details = value as Record<string, unknown>;
        const description =
          (details?.description as string) || "Aucune description";
        return (
          <span
            className="text-sm text-gray-600 truncate block max-w-[180px]"
            title={description}
          >
            {description}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      className: "w-20",
      align: "center",
      render: (_, log) => (
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => handleViewLog(log)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const columns = allColumns.filter((col) =>
    visibleColumnKeys.includes(col.key)
  );

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">
          Erreur lors du chargement des journaux d&apos;audit: {error?.message}
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between"></div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Journaux d&apos;audit
          </h1>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 ${
                  actionFilter ? "bg-blue-50 text-blue-700 border-blue-300" : ""
                }`}
              >
                <Filter className="w-4 h-4" />
                Action
                {actionFilter && (
                  <span className="bg-blue-200 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filtrer par action</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={`cursor-pointer ${
                  !actionFilter ? "bg-blue-50 text-blue-700" : ""
                }`}
                onSelect={() => handleActionFilterChange(undefined)}
              >
                Toutes les actions
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`cursor-pointer ${
                  actionFilter === "create" ? "bg-blue-50 text-blue-700" : ""
                }`}
                onSelect={() => handleActionFilterChange("create")}
              >
                Création
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`cursor-pointer ${
                  actionFilter === "update" ? "bg-blue-50 text-blue-700" : ""
                }`}
                onSelect={() => handleActionFilterChange("update")}
              >
                Modification
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`cursor-pointer ${
                  actionFilter === "delete" ? "bg-blue-50 text-blue-700" : ""
                }`}
                onSelect={() => handleActionFilterChange("delete")}
              >
                Suppression
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`cursor-pointer ${
                  actionFilter === "status_change"
                    ? "bg-blue-50 text-blue-700"
                    : ""
                }`}
                onSelect={() => handleActionFilterChange("status_change")}
              >
                Changement statut
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 ${
                  entityTypeFilter
                    ? "bg-blue-50 text-blue-700 border-blue-300"
                    : ""
                }`}
              >
                <Filter className="w-4 h-4" />
                Type
                {entityTypeFilter && (
                  <span className="bg-blue-200 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filtrer par type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={`cursor-pointer ${
                  !entityTypeFilter ? "bg-blue-50 text-blue-700" : ""
                }`}
                onSelect={() => handleEntityTypeFilterChange(undefined)}
              >
                Tous les types
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`cursor-pointer ${
                  entityTypeFilter === "employee"
                    ? "bg-blue-50 text-blue-700"
                    : ""
                }`}
                onSelect={() => handleEntityTypeFilterChange("employee")}
              >
                Employé
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`cursor-pointer ${
                  entityTypeFilter === "detainee"
                    ? "bg-blue-50 text-blue-700"
                    : ""
                }`}
                onSelect={() => handleEntityTypeFilterChange("detainee")}
              >
                Détenu
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`cursor-pointer ${
                  entityTypeFilter === "report"
                    ? "bg-blue-50 text-blue-700"
                    : ""
                }`}
                onSelect={() => handleEntityTypeFilterChange("report")}
              >
                Rapport
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`cursor-pointer ${
                  entityTypeFilter === "statement"
                    ? "bg-blue-50 text-blue-700"
                    : ""
                }`}
                onSelect={() => handleEntityTypeFilterChange("statement")}
              >
                Déclaration
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`cursor-pointer ${
                  entityTypeFilter === "incident"
                    ? "bg-blue-50 text-blue-700"
                    : ""
                }`}
                onSelect={() => handleEntityTypeFilterChange("incident")}
              >
                Incident
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`cursor-pointer ${
                  entityTypeFilter === "seizure"
                    ? "bg-blue-50 text-blue-700"
                    : ""
                }`}
                onSelect={() => handleEntityTypeFilterChange("seizure")}
              >
                Saisie
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`cursor-pointer ${
                  entityTypeFilter === "user" ? "bg-blue-50 text-blue-700" : ""
                }`}
                onSelect={() => handleEntityTypeFilterChange("user")}
              >
                Utilisateur
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column Visibility */}
          <ColumnVisibility
            columns={columnVisibility}
            onVisibilityChange={handleColumnVisibilityChange}
            storageKey="audit-logs-columns"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-gray-600">
              Chargement des journaux d&apos;audit...
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <DataTable<AuditLog>
          columns={columns}
          data={auditLogs as AuditLog[]}
          keyField="id"
          emptyMessage="Aucun journal d'audit trouvé"
          pagination={paginationConfig}
          showPagination={!!paginationConfig}
          sortConfig={sortConfig}
          onRowClick={handleRowClick}
        />
      )}

      {/* Audit Log Details Dialog */}
      <AuditLogDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setViewingLog(null);
        }}
        log={viewingLog}
      />
    </div>
  );
}

// Define column configuration for visibility control
export const auditLogColumnConfig = [
  { key: "createdAt", label: "Date & Heure", hideable: false },
  { key: "action", label: "Action", hideable: false },
  { key: "entityType", label: "Type d'entité", hideable: false },
  { key: "entityId", label: "ID Entité", hideable: true },
  { key: "userFirstName", label: "Utilisateur", hideable: false },
  { key: "details", label: "Détails", hideable: true },
  { key: "actions", label: "Actions", hideable: false },
];

// Export the AuditLog type so it can be used in other files
export type { AuditLog };
