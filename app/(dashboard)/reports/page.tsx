"use client";

import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  ReportsTable,
  type Report,
  reportColumnConfig,
} from "./components/reports-table";
import { ReportForm, type ReportFormValues } from "./components/report-form";
import { useState, useCallback } from "react";
import { PaginationConfig } from "@/components/data-table";
import {
  ColumnVisibility,
  type ColumnVisibilityOption,
} from "@/components/column-visibility";

// Dummy data for reports - Adapted for DRC context (North Kivu focus)
const reports: Report[] = [
  {
    id: "RPT001",
    photo: "/api/placeholder/40/40",
    titreRapport: "Rapport d'enquête - Vol de véhicule à Goma",
    dateRapport: "15/08/2024",
    lieuRapport: "Goma Centre",
    auteurRapport: "Inspecteur Pierre Mukamba",
    createdBy: "Agent Enquête",
    updatedBy: "Chef Brigade",
    createdAt: "15 Aug, 2024",
    updatedAt: "28 Aug, 2024",
  },
  {
    id: "RPT002",
    photo: "/api/placeholder/40/40",
    titreRapport: "Rapport d'arrestation - Trafic de stupéfiants",
    dateRapport: "20/08/2024",
    lieuRapport: "Masisi Centre",
    auteurRapport: "Agent Marie Kasongo",
    createdBy: "Officier Judiciaire",
    updatedBy: "Capitaine Sécurité",
    createdAt: "20 Aug, 2024",
    updatedAt: "29 Aug, 2024",
  },
  {
    id: "RPT003",
    photo: "/api/placeholder/40/40",
    titreRapport: "Rapport de saisie - Marchandises illégales",
    dateRapport: "10/08/2024",
    lieuRapport: "Rutshuru",
    auteurRapport: "Sergent Joseph Ilunga",
    createdBy: "Agent Police",
    updatedBy: "Directeur Station",
    createdAt: "10 Aug, 2024",
    updatedAt: "25 Aug, 2024",
  },
  {
    id: "RPT004",
    photo: "/api/placeholder/40/40",
    titreRapport: "Rapport de transfert - Détenu vers Nyanza",
    dateRapport: "05/08/2024",
    lieuRapport: "Goma - Karisimbi",
    auteurRapport: "Agent Agnès Mwenze",
    createdBy: "Gestionnaire Dossier",
    updatedBy: "Procureur Adjoint",
    createdAt: "05 Aug, 2024",
    updatedAt: "30 Aug, 2024",
  },
  {
    id: "RPT005",
    photo: "/api/placeholder/40/40",
    titreRapport: "Rapport de libération - Fin de peine",
    dateRapport: "12/08/2024",
    lieuRapport: "Goma - Murara",
    auteurRapport: "Commissaire David Kabeya",
    createdBy: "Brigade Spécialisée",
    updatedBy: "Chef Technique",
    createdAt: "12 Aug, 2024",
    updatedAt: "30 Aug, 2024",
  },
];

export default function ReportsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [columnVisibility, setColumnVisibility] = useState<
    ColumnVisibilityOption[]
  >(reportColumnConfig.map((col) => ({ ...col, visible: true })));

  const itemsPerPage = 5;
  const totalItems = 1000; // This would come from your API
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginationConfig: PaginationConfig = {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange: setCurrentPage,
  };

  const handleAddReport = (data: ReportFormValues) => {
    // This is where you would typically send the data to your backend
    console.log("New report data:", data);
    // For now, we'll just log it since there's no backend yet
    // You can add logic here to add the report to your state or call an API
  };

  const handleColumnVisibilityChange = useCallback(
    (columns: ColumnVisibilityOption[]) => {
      setColumnVisibility(columns);
    },
    []
  );

  const visibleColumnKeys = columnVisibility
    .filter((col) => col.visible)
    .map((col) => col.key);

  return (
    <div className="p-6 mt-8 rounded-lg bg-white min-h-[calc(30vh)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
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
            storageKey="reports-columns"
          />
          <ReportForm onSubmit={handleAddReport} />
        </div>
      </div>
      {/* Table */}
      <ReportsTable
        reports={reports}
        pagination={paginationConfig}
        visibleColumns={visibleColumnKeys}
      />
    </div>
  );
}
