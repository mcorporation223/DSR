"use client";

import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  DetaineesTable,
  type Detainee,
  detaineeColumnConfig,
} from "./components/detainee-table";
import {
  DetaineeForm,
  type DetaineeFormValues,
} from "./components/detainee-form";
import { useState, useCallback } from "react";
import { PaginationConfig } from "@/components/data-table";
import {
  ColumnVisibility,
  type ColumnVisibilityOption,
} from "@/components/column-visibility";

// Dummy data for detainees - Adapted for DRC context (North Kivu focus)
const detainees: Detainee[] = [
  {
    id: "DET001",
    photo: "/api/placeholder/40/40",
    nom: "Pierre Mukamba Tshimanga",
    sex: "Homme",
    lieuNaissance: "Goma",
    dateNaissance: "20/05/1988",
    etatCivil: "Marié(e)",
    religion: "Catholique",
    etudesFaites: "Études Secondaires",
    employment: "Commerçant",
    statutDetention: "En détention",
    dateArrestation: "15/08/2024",
    lieuArrestation: "Goma Centre",
    motifArrestation: "Vol à main armée",
    residence: "Goma - Himbi",
    telephone: "+243 970 123 456",
    email: "p.mukamba@email.com",
    createdBy: "Agent Sécurité",
    updatedBy: "Commissaire Adjoint",
    createdAt: "15 Aug, 2024",
    updatedAt: "28 Aug, 2024",
  },
  {
    id: "DET002",
    photo: "/api/placeholder/40/40",
    nom: "Marie Kasongo Muela",
    sex: "Femme",
    lieuNaissance: "Masisi",
    dateNaissance: "10/12/1992",
    etatCivil: "Célibataire",
    religion: "Protestante",
    etudesFaites: "Licence en Comptabilité",
    employment: "Comptable",
    statutDetention: "En détention",
    dateArrestation: "20/08/2024",
    lieuArrestation: "Masisi Centre",
    motifArrestation: "Fraude documentaire",
    residence: "Masisi Centre",
    telephone: "+243 970 654 321",
    email: "m.kasongo@email.com",
    createdBy: "Officier Judiciaire",
    updatedBy: "Juge d'Instruction",
    createdAt: "20 Aug, 2024",
    updatedAt: "29 Aug, 2024",
  },
  {
    id: "DET003",
    photo: "/api/placeholder/40/40",
    nom: "Joseph Ilunga Kabongo",
    sex: "Homme",
    lieuNaissance: "Rutshuru",
    dateNaissance: "05/09/1985",
    etatCivil: "Divorcé(e)",
    religion: "Catholique",
    etudesFaites: "Formation Professionnelle",
    employment: "Mécanicien",
    statutDetention: "Transféré",
    dateArrestation: "10/08/2024",
    lieuArrestation: "Rutshuru",
    motifArrestation: "Agression physique",
    residence: "Rutshuru Centre",
    telephone: "+243 970 987 654",
    email: "j.ilunga@email.com",
    createdBy: "Agent Police",
    updatedBy: "Directeur Prison",
    createdAt: "10 Aug, 2024",
    updatedAt: "25 Aug, 2024",
  },
  {
    id: "DET004",
    photo: "/api/placeholder/40/40",
    nom: "Agnès Mwenze Kalombo",
    sex: "Femme",
    lieuNaissance: "Goma",
    dateNaissance: "18/07/1990",
    etatCivil: "Veuf(ve)",
    religion: "Kimbanguiste",
    etudesFaites: "Études Primaires",
    employment: "Vendeuse",
    statutDetention: "Libéré",
    dateArrestation: "05/08/2024",
    lieuArrestation: "Goma - Karisimbi",
    motifArrestation: "Trouble à l'ordre public",
    residence: "Goma - Karisimbi",
    telephone: "+243 970 111 222",
    email: "a.mwenze@email.com",
    createdBy: "Gestionnaire Dossier",
    updatedBy: "Procureur",
    createdAt: "05 Aug, 2024",
    updatedAt: "30 Aug, 2024",
  },
  {
    id: "DET005",
    photo: "/api/placeholder/40/40",
    nom: "David Kabeya Tshilombo",
    sex: "Homme",
    lieuNaissance: "Masisi",
    dateNaissance: "25/11/1987",
    etatCivil: "Célibataire",
    religion: "Musulman",
    etudesFaites: "Master en Informatique",
    employment: "Informaticien",
    statutDetention: "En détention",
    dateArrestation: "12/08/2024",
    lieuArrestation: "Goma - Murara",
    motifArrestation: "Trafic de stupéfiants",
    residence: "Goma - Murara",
    telephone: "+243 970 333 444",
    email: "d.kabeya@email.com",
    createdBy: "Brigade Stupéfiants",
    updatedBy: "Chef Brigade",
    createdAt: "12 Aug, 2024",
    updatedAt: "30 Aug, 2024",
  },
];

export default function DetaineesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [columnVisibility, setColumnVisibility] = useState<
    ColumnVisibilityOption[]
  >(detaineeColumnConfig.map((col) => ({ ...col, visible: true })));

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

  const handleAddDetainee = (data: DetaineeFormValues) => {
    // This is where you would typically send the data to your backend
    console.log("New detainee data:", data);
    // For now, we'll just log it since there's no backend yet
    // You can add logic here to add the detainee to your state or call an API
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
          <h1 className="text-2xl font-bold text-gray-900">Détenus</h1>
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
            storageKey="detainees-columns"
          />
          <DetaineeForm onSubmit={handleAddDetainee} />
        </div>
      </div>
      {/* Table */}
      <DetaineesTable
        detainees={detainees}
        pagination={paginationConfig}
        visibleColumns={visibleColumnKeys}
      />
    </div>
  );
}
