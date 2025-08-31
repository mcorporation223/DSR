"use client";

import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  SaisieTable,
  type Saisie,
  saisieColumnConfig,
} from "./components/saisie-table";
import { SaisieForm, type SaisieFormValues } from "./components/saisie-form";
import { useState, useCallback } from "react";
import { PaginationConfig } from "@/components/data-table";
import {
  ColumnVisibility,
  type ColumnVisibilityOption,
} from "@/components/column-visibility";

// Dummy data for saisies - Adapted for DRC context (North Kivu focus)
const saisies: Saisie[] = [
  {
    id: "SAI001",
    photo: "/api/placeholder/40/40",
    typeSaisie: "Voiture",
    dateSaisie: "15/08/2024",
    lieuSaisie: "Goma Centre",
    proprietaire: "Pierre Mukamba Tshimanga",
    dateRestitution: "",
    createdBy: "Agent Saisie",
    updatedBy: "Chef Brigade",
    createdAt: "15 Aug, 2024",
    updatedAt: "28 Aug, 2024",
  },
  {
    id: "SAI002",
    photo: "/api/placeholder/40/40",
    typeSaisie: "Moto",
    dateSaisie: "20/08/2024",
    lieuSaisie: "Masisi Centre",
    proprietaire: "Marie Kasongo Muela",
    dateRestitution: "",
    createdBy: "Officier Judiciaire",
    updatedBy: "Capitaine Sécurité",
    createdAt: "20 Aug, 2024",
    updatedAt: "29 Aug, 2024",
  },
  {
    id: "SAI003",
    photo: "/api/placeholder/40/40",
    typeSaisie: "Moto",
    dateSaisie: "10/08/2024",
    lieuSaisie: "Rutshuru",
    proprietaire: "Joseph Ilunga Kabongo",
    dateRestitution: "25/08/2024",
    createdBy: "Agent Police",
    updatedBy: "Directeur Station",
    createdAt: "10 Aug, 2024",
    updatedAt: "25 Aug, 2024",
  },
  {
    id: "SAI004",
    photo: "/api/placeholder/40/40",
    typeSaisie: "Voiture",
    dateSaisie: "05/08/2024",
    lieuSaisie: "Goma - Karisimbi",
    proprietaire: "Agnès Mwenze Kalombo",
    dateRestitution: "",
    createdBy: "Gestionnaire Dossier",
    updatedBy: "Procureur Adjoint",
    createdAt: "05 Aug, 2024",
    updatedAt: "30 Aug, 2024",
  },
  {
    id: "SAI005",
    photo: "/api/placeholder/40/40",
    typeSaisie: "Voiture",
    dateSaisie: "12/08/2024",
    lieuSaisie: "Goma - Murara",
    proprietaire: "David Kabeya Tshilombo",
    dateRestitution: "",
    createdBy: "Brigade Spécialisée",
    updatedBy: "Chef Technique",
    createdAt: "12 Aug, 2024",
    updatedAt: "30 Aug, 2024",
  },
];

export default function SaisiePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [columnVisibility, setColumnVisibility] = useState<
    ColumnVisibilityOption[]
  >(saisieColumnConfig.map((col) => ({ ...col, visible: true })));

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

  const handleAddSaisie = (data: SaisieFormValues) => {
    // This is where you would typically send the data to your backend
    console.log("New saisie data:", data);
    // For now, we'll just log it since there's no backend yet
    // You can add logic here to add the saisie to your state or call an API
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
          <h1 className="text-2xl font-bold text-gray-900">Saisies</h1>
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
            storageKey="saisies-columns"
          />
          <SaisieForm onSubmit={handleAddSaisie} />
        </div>
      </div>
      {/* Table */}
      <SaisieTable
        saisies={saisies}
        pagination={paginationConfig}
        visibleColumns={visibleColumnKeys}
      />
    </div>
  );
}
