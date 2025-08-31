"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, Download } from "lucide-react";
import {
  DataTable,
  TableColumn,
  PaginationConfig,
} from "@/components/data-table";

// Types for saisie data
interface Saisie extends Record<string, unknown> {
  id: string;
  photo: string;
  typeSaisie: "Voiture" | "Moto";
  dateSaisie: string;
  lieuSaisie: string;

  proprietaire: string;
  dateRestitution?: string;

  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface SaisieTableProps {
  saisies: Saisie[];
  pagination?: PaginationConfig;
  visibleColumns?: string[];
}

export function SaisieTable({
  saisies,
  pagination,
  visibleColumns,
}: SaisieTableProps) {
  const allColumns: TableColumn<Saisie>[] = [
    {
      key: "typeSaisie",
      label: "Type",
      className: "w-28 px-4",
      render: (value) => {
        const type = value as string;
        let colorClass = "";
        switch (type) {
          case "Voiture":
            colorClass = "bg-blue-100 text-blue-700";
            break;
          case "Moto":
            colorClass = "bg-green-100 text-green-700";
            break;
          default:
            colorClass = "bg-gray-100 text-gray-700";
        }
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-gray-600">
                {type === "Voiture" ? "V" : "M"}
              </span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
              {type}
            </span>
          </div>
        );
      },
    },
    {
      key: "dateSaisie",
      label: "Date Saisie",
      className: "w-28",
      render: (value) => (
        <span className="text-sm text-gray-900">{value as string}</span>
      ),
    },
    {
      key: "lieuSaisie",
      label: "Lieu Saisie",
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
      key: "proprietaire",
      label: "Propriétaire",
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
      key: "dateRestitution",
      label: "Date Restitution",
      className: "w-36",
      render: (value) => (
        <span className="text-sm text-gray-900">
          {value ? (value as string) : "-"}
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
    <DataTable<Saisie>
      columns={columns}
      data={saisies}
      keyField="id"
      emptyMessage="Aucune saisie trouvée"
      pagination={pagination}
      showPagination={!!pagination}
    />
  );
}

// Define column configuration for visibility control
export const saisieColumnConfig = [
  { key: "typeSaisie", label: "Type", hideable: false },
  { key: "dateSaisie", label: "Date Saisie", hideable: false },
  { key: "lieuSaisie", label: "Lieu Saisie", hideable: false },
  { key: "proprietaire", label: "Propriétaire", hideable: false },
  { key: "dateRestitution", label: "Date Restitution", hideable: true },
  { key: "createdBy", label: "Créé par", hideable: false },
  { key: "updatedBy", label: "Modifié par", hideable: false },
  { key: "createdAt", label: "Date de Création", hideable: false },
  { key: "updatedAt", label: "Date de Modification", hideable: false },
  { key: "actions", label: "Actions", hideable: false },
];

// Export the Saisie type so it can be used in other files
export type { Saisie };
