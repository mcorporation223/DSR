"use client";

import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  IncidentTable,
  type Incident,
  incidentColumnConfig,
} from "./components/incident-table";
import {
  IncidentForm,
  type IncidentFormValues,
} from "./components/incident-form";
import { useState, useCallback } from "react";
import { PaginationConfig } from "@/components/data-table";
import {
  ColumnVisibility,
  type ColumnVisibilityOption,
} from "@/components/column-visibility";

// Dummy data for incidents - Adapted for DRC context (North Kivu focus)
const incidents: Incident[] = [
  {
    id: "INC001",
    typeIncident: "Assassinats",
    dateIncident: "15/08/2024",
    lieuIncident: "Goma Centre - Avenue des Volcans",
    nombre: 2,
    sex: "Mixte",
    causeDuDeces: "Balle",
    noms: "Jean Baptiste Mukamba, Marie Claire Kasongo",
    createdBy: "Agent Police",
    updatedBy: "Chef Brigade",
    createdAt: "15 Aug, 2024",
    updatedAt: "28 Aug, 2024",
  },
  {
    id: "INC002",
    typeIncident: "Fusillades",
    dateIncident: "20/08/2024",
    lieuIncident: "Masisi Centre - Marché Central",
    createdBy: "Officier Judiciaire",
    updatedBy: "Procureur Adjoint",
    createdAt: "20 Aug, 2024",
    updatedAt: "25 Aug, 2024",
  },
  {
    id: "INC003",
    typeIncident: "Assassinats",
    dateIncident: "10/08/2024",
    lieuIncident: "Rutshuru - Quartier Kirumba",
    nombre: 1,
    sex: "Homme",
    causeDuDeces: "Arme blanche",
    noms: "Joseph Ilunga Kabongo",
    createdBy: "Agent Police",
    updatedBy: "Directeur Station",
    createdAt: "10 Aug, 2024",
    updatedAt: "12 Aug, 2024",
  },
  {
    id: "INC004",
    typeIncident: "Fusillades",
    dateIncident: "05/08/2024",
    lieuIncident: "Goma - Karisimbi",
    createdBy: "Gestionnaire Dossier",
    updatedBy: "Chef Technique",
    createdAt: "05 Aug, 2024",
    updatedAt: "05 Aug, 2024",
  },
  {
    id: "INC005",
    typeIncident: "Assassinats",
    dateIncident: "12/08/2024",
    lieuIncident: "Goma - Murara",
    nombre: 3,
    sex: "Femme",
    causeDuDeces: "Étranglement",
    noms: "Agnès Mwenze Kalombo, Claire Mbuyu Ngoy, Solange Tshimanga",
    createdBy: "Agent Circulation",
    updatedBy: "Médecin Urgentiste",
    createdAt: "12 Aug, 2024",
    updatedAt: "30 Aug, 2024",
  },
  {
    id: "INC006",
    typeIncident: "Fusillades",
    dateIncident: "18/08/2024",
    lieuIncident: "Goma - Himbi II",
    createdBy: "Agent Patrouille",
    updatedBy: "Chef Enquête",
    createdAt: "18 Aug, 2024",
    updatedAt: "29 Aug, 2024",
  },
];

export default function IncidentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [columnVisibility, setColumnVisibility] = useState<
    ColumnVisibilityOption[]
  >(incidentColumnConfig.map((col) => ({ ...col, visible: true })));

  const itemsPerPage = 5;
  const totalItems = 1200; // This would come from your API
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginationConfig: PaginationConfig = {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange: setCurrentPage,
  };

  const handleAddIncident = (data: IncidentFormValues) => {
    // This is where you would typically send the data to your backend
    console.log("New incident data:", data);
    // For now, we'll just log it since there's no backend yet
    // You can add logic here to add the incident to your state or call an API
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
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
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
            storageKey="incidents-columns"
          />
          <IncidentForm onSubmit={handleAddIncident} />
        </div>
      </div>
      {/* Table */}
      <IncidentTable
        incidents={incidents}
        pagination={paginationConfig}
        visibleColumns={visibleColumnKeys}
      />
    </div>
  );
}
