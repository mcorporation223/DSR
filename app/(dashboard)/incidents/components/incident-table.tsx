"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, Download } from "lucide-react";
import {
  DataTable,
  TableColumn,
  PaginationConfig,
} from "@/components/data-table";

// Types for incident data
interface Victim {
  nom: string;
  sexe: "Homme" | "Femme";
  causeDuDeces: string;
}

interface Incident extends Record<string, unknown> {
  id: string;
  typeIncident: "Assassinats" | "Fusillades";
  dateIncident: string;
  lieuIncident: string;
  // Additional fields for Assassinats
  nombre?: number;
  victimes?: Victim[];
  // Legacy fields for backwards compatibility
  sex?: "Homme" | "Femme" | "Mixte";
  causeDuDeces?: string;
  noms?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface IncidentTableProps {
  incidents: Incident[];
  pagination?: PaginationConfig;
  visibleColumns?: string[];
}

export function IncidentTable({
  incidents,
  pagination,
  visibleColumns,
}: IncidentTableProps) {
  const allColumns: TableColumn<Incident>[] = [
    {
      key: "typeIncident",
      label: "Type",
      className: "w-32 px-4",
      render: (value) => {
        const type = value as string;
        return <span className="text-sm text-gray-900">{type}</span>;
      },
    },
    {
      key: "dateIncident",
      label: "Date Incident",
      className: "w-32",
      render: (value) => (
        <span className="text-sm text-gray-900">{value as string}</span>
      ),
    },
    {
      key: "lieuIncident",
      label: "Lieu",
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
      key: "nombre",
      label: "Nombre",
      className: "w-20",
      align: "center",
      render: (value, row) => {
        // Only show for Assassinats
        if (row.typeIncident === "Assassinats") {
          return (
            <span className="text-sm text-gray-900 font-medium">
              {value ? (value as number) : "-"}
            </span>
          );
        }
        return <span className="text-sm text-gray-400">-</span>;
      },
    },
    {
      key: "sex",
      label: "Sexe",
      className: "w-24",
      render: (value, row) => {
        // Only show for Assassinats
        if (row.typeIncident === "Assassinats") {
          // Check if we have victimes array
          if (
            row.victimes &&
            Array.isArray(row.victimes) &&
            row.victimes.length > 0
          ) {
            const sexes = row.victimes.map((v) => v.sexe);
            const uniqueSexes = [...new Set(sexes)];
            if (uniqueSexes.length === 1) {
              return (
                <span className="text-sm text-gray-900">{uniqueSexes[0]}</span>
              );
            } else {
              return <span className="text-sm text-gray-900">Mixte</span>;
            }
          }
          // Fallback to legacy sex field
          const sex = value as string;
          return value ? (
            <span className="text-sm text-gray-900">{sex}</span>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          );
        }
        return <span className="text-sm text-gray-400">-</span>;
      },
    },
    {
      key: "causeDuDeces",
      label: "Cause du Décès",
      className: "w-48",
      render: (value, row) => {
        // Only show for Assassinats
        if (row.typeIncident === "Assassinats") {
          // Check if we have victimes array
          if (
            row.victimes &&
            Array.isArray(row.victimes) &&
            row.victimes.length > 0
          ) {
            const causes = row.victimes.map((v) => v.causeDuDeces);
            const uniqueCauses = [...new Set(causes)];
            const displayText =
              uniqueCauses.length > 1
                ? uniqueCauses.join(", ")
                : uniqueCauses[0];
            return (
              <span
                className="text-sm text-gray-900 truncate block max-w-[180px]"
                title={displayText}
              >
                {displayText}
              </span>
            );
          }
          // Fallback to legacy causeDuDeces field
          return (
            <span
              className="text-sm text-gray-900 truncate block max-w-[180px]"
              title={value as string}
            >
              {value ? (value as string) : "-"}
            </span>
          );
        }
        return <span className="text-sm text-gray-400">-</span>;
      },
    },
    {
      key: "noms",
      label: "Noms",
      className: "w-48",
      render: (value, row) => {
        // Only show for Assassinats
        if (row.typeIncident === "Assassinats") {
          // Check if we have victimes array
          if (
            row.victimes &&
            Array.isArray(row.victimes) &&
            row.victimes.length > 0
          ) {
            const noms = row.victimes
              .map((v) => v.nom)
              .filter((nom) => nom.trim() !== "")
              .join(", ");
            return (
              <span
                className="text-sm text-gray-900 truncate block max-w-[180px]"
                title={noms}
              >
                {noms || "-"}
              </span>
            );
          }
          // Fallback to legacy noms field
          return (
            <span
              className="text-sm text-gray-900 truncate block max-w-[180px]"
              title={value as string}
            >
              {value ? (value as string) : "-"}
            </span>
          );
        }
        return <span className="text-sm text-gray-400">-</span>;
      },
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
    <DataTable<Incident>
      columns={columns}
      data={incidents}
      keyField="id"
      emptyMessage="Aucun incident trouvé"
      pagination={pagination}
      showPagination={!!pagination}
    />
  );
}

// Define column configuration for visibility control
export const incidentColumnConfig = [
  { key: "typeIncident", label: "Type", hideable: false },
  { key: "dateIncident", label: "Date Incident", hideable: false },
  { key: "lieuIncident", label: "Lieu", hideable: false },
  { key: "nombre", label: "Nombre", hideable: true },
  { key: "sex", label: "Sexe", hideable: true },
  { key: "causeDuDeces", label: "Cause du Décès", hideable: true },
  { key: "noms", label: "Noms", hideable: true },
  { key: "createdBy", label: "Créé par", hideable: false },
  { key: "updatedBy", label: "Modifié par", hideable: false },
  { key: "createdAt", label: "Date de Création", hideable: false },
  { key: "updatedAt", label: "Date de Modification", hideable: false },
  { key: "actions", label: "Actions", hideable: false },
];

// Export the Incident type so it can be used in other files
export type { Incident, Victim };
