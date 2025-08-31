"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, Download } from "lucide-react";
import {
  DataTable,
  TableColumn,
  PaginationConfig,
} from "@/components/data-table";

// Types for detainee data
interface Detainee extends Record<string, unknown> {
  id: string;
  photo: string;
  nom: string;
  sex: "Homme" | "Femme";
  lieuNaissance: string;
  dateNaissance: string;
  etatCivil: "Célibataire" | "Marié(e)" | "Divorcé(e)" | "Veuf(ve)";
  religion: string;
  etudesFaites: string;
  employment: string;

  statutDetention: "En détention" | "Libéré" | "Transféré";
  dateArrestation: string;
  lieuArrestation: string;
  motifArrestation: string;

  telephone: string;
  email: string;
  residence: string;

  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface DetaineesTableProps {
  detainees: Detainee[];
  pagination?: PaginationConfig;
  visibleColumns?: string[];
}

export function DetaineesTable({
  detainees,
  pagination,
  visibleColumns,
}: DetaineesTableProps) {
  const allColumns: TableColumn<Detainee>[] = [
    {
      key: "nom",
      label: "Nom",
      className: "w-48 px-4",
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-gray-600">
              {(value as string)
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
          </div>
          <div
            className="text-sm font-medium text-gray-900 truncate max-w-[140px]"
            title={value as string}
          >
            {value as string}
          </div>
        </div>
      ),
    },
    {
      key: "sex",
      label: "Sexe",
      className: "w-20",
      render: (value) => (
        <span className="text-sm text-gray-900">{value as string}</span>
      ),
    },
    {
      key: "lieuNaissance",
      label: "Lieu de Naissance",
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
      key: "dateNaissance",
      label: "Date de Naissance",
      className: "w-32",
      render: (value) => (
        <span className="text-sm text-gray-900">{value as string}</span>
      ),
    },
    {
      key: "etatCivil",
      label: "État Civil",
      className: "w-28",
      render: (value) => (
        <span className="text-sm text-gray-900">{value as string}</span>
      ),
    },
    {
      key: "religion",
      label: "Religion",
      className: "w-32",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[120px]"
          title={value as string}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "etudesFaites",
      label: "Études Faites",
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
      key: "employment",
      label: "Employment",
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
      key: "statutDetention",
      label: "Statut Détention",
      className: "w-36",
      render: (value) => {
        const status = value as string;
        let colorClass = "";
        switch (status) {
          case "En détention":
            colorClass = "bg-red-100 text-red-700";
            break;
          case "Libéré":
            colorClass = "bg-green-100 text-green-700";
            break;
          case "Transféré":
            colorClass = "bg-blue-100 text-blue-700";
            break;
          default:
            colorClass = "bg-gray-100 text-gray-700";
        }
        return (
          <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: "dateArrestation",
      label: "Date d'Arrestation",
      className: "w-36",
      render: (value) => (
        <span className="text-sm text-gray-900">{value as string}</span>
      ),
    },
    {
      key: "lieuArrestation",
      label: "Lieu d'Arrestation",
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
      key: "motifArrestation",
      label: "Motif d'Arrestation",
      className: "w-44",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[160px]"
          title={value as string}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "telephone",
      label: "Téléphone",
      className: "w-32",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[120px]"
          title={value as string}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      className: "w-48",
      render: (value) => (
        <span
          className="text-sm text-gray-900 truncate block max-w-[180px]"
          title={value as string}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "residence",
      label: "Résidence",
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
    <DataTable<Detainee>
      columns={columns}
      data={detainees}
      keyField="id"
      emptyMessage="Aucun détenu trouvé"
      pagination={pagination}
      showPagination={!!pagination}
    />
  );
}

// Define column configuration for visibility control
export const detaineeColumnConfig = [
  { key: "nom", label: "Nom", hideable: false },
  { key: "sex", label: "Sexe", hideable: true },
  { key: "lieuNaissance", label: "Lieu de Naissance", hideable: true },
  { key: "dateNaissance", label: "Date de Naissance", hideable: true },
  { key: "etatCivil", label: "État Civil", hideable: true },
  { key: "religion", label: "Religion", hideable: true },
  { key: "etudesFaites", label: "Études Faites", hideable: true },
  { key: "employment", label: "Employment", hideable: true },
  { key: "statutDetention", label: "Statut Détention", hideable: false },
  { key: "dateArrestation", label: "Date d'Arrestation", hideable: false },
  { key: "lieuArrestation", label: "Lieu d'Arrestation", hideable: false },
  { key: "motifArrestation", label: "Motif d'Arrestation", hideable: false },
  { key: "telephone", label: "Téléphone", hideable: false },
  { key: "email", label: "Email", hideable: true },
  { key: "residence", label: "Résidence", hideable: true },
  { key: "createdBy", label: "Créé par", hideable: false },
  { key: "updatedBy", label: "Modifié par", hideable: false },
  { key: "createdAt", label: "Date de Création", hideable: false },
  { key: "updatedAt", label: "Date de Modification", hideable: false },
  { key: "actions", label: "Actions", hideable: false },
];

// Export the Detainee type so it can be used in other files
export type { Detainee };
