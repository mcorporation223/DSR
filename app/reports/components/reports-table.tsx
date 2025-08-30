"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, Download } from "lucide-react";
import {
  DataTable,
  TableColumn,
  PaginationConfig,
} from "@/components/data-table";

// Types for report data
interface Report extends Record<string, unknown> {
  id: string;
  photo: string;
  titreRapport: string;
  dateRapport: string;
  lieuRapport: string;

  auteurRapport: string;

  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportsTableProps {
  reports: Report[];
  pagination?: PaginationConfig;
  visibleColumns?: string[];
}

export function ReportsTable({
  reports,
  pagination,
  visibleColumns,
}: ReportsTableProps) {
  const allColumns: TableColumn<Report>[] = [
    {
      key: "titreRapport",
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
      key: "dateRapport",
      label: "Date Rapport",
      className: "w-28",
      render: (value) => (
        <span className="text-sm text-gray-900">{value as string}</span>
      ),
    },
    {
      key: "lieuRapport",
      label: "Lieu Rapport",
      className: "w-36",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[130px]"
          title={value as string}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "auteurRapport",
      label: "Auteur",
      className: "w-40",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[150px]"
          title={value as string}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "createdBy",
      label: "Créé par",
      className: "w-32",
      render: (value) => (
        <span
          className="text-sm text-gray-600 truncate block max-w-[120px]"
          title={value as string}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "updatedBy",
      label: "Modifié par",
      className: "w-32",
      render: (value) => (
        <span
          className="text-sm text-gray-600 truncate block max-w-[120px]"
          title={value as string}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date de Création",
      className: "w-36",
      render: (value) => (
        <span className="text-sm text-gray-600">{value as string}</span>
      ),
    },
    {
      key: "updatedAt",
      label: "Date de Modification",
      className: "w-40",
      render: (value) => (
        <span className="text-sm text-gray-600">{value as string}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "w-24",
      align: "center",
      render: () => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Filter columns based on visibility
  const columns = visibleColumns
    ? allColumns.filter((column) => visibleColumns.includes(column.key))
    : allColumns;

  return (
    <DataTable<Report>
      columns={columns}
      data={reports}
      keyField="id"
      emptyMessage="Aucun rapport trouvé"
      pagination={pagination}
      showPagination={!!pagination}
    />
  );
}

// Define column configuration for visibility control
export const reportColumnConfig = [
  { key: "titreRapport", label: "Titre", hideable: false },
  { key: "dateRapport", label: "Date Rapport", hideable: false },
  { key: "lieuRapport", label: "Lieu Rapport", hideable: false },
  { key: "auteurRapport", label: "Auteur", hideable: false },
  { key: "createdBy", label: "Créé par", hideable: false },
  { key: "updatedBy", label: "Modifié par", hideable: false },
  { key: "createdAt", label: "Date de Création", hideable: false },
  { key: "updatedAt", label: "Date de Modification", hideable: false },
  { key: "actions", label: "Actions", hideable: false },
];

// Export the Report type so it can be used in other files
export type { Report };
