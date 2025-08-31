"use client";

import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  EmployeesTable,
  type Employee,
  employeeColumnConfig,
} from "./components/employees-table";
import {
  EmployeeForm,
  type EmployeeFormValues,
} from "./components/employee-form";
import { useState, useCallback } from "react";
import { PaginationConfig } from "@/components/data-table";
import {
  ColumnVisibility,
  type ColumnVisibilityOption,
} from "@/components/column-visibility";

// Dummy data for employees - Adapted for DRC government department (North Kivu focus)
const employees: Employee[] = [
  {
    id: "EMP001",
    photo: "/api/placeholder/40/40",
    nom: "Jean-Baptiste Mbemba Tshimanga",
    sex: "Homme",
    lieuNaissance: "Goma",
    dateNaissance: "15/03/1985",
    formation: "Licence en Administration Publique",
    etatCivil: "Marié(e)",
    fonction: "Chef de Service",
    lieuDeployment: "Nord-Kivu - Goma",
    residence: "Goma - Himbi",
    telephone: "+243 970 123 456",
    email: "j.mbemba@dsr.gov.cd",
    status: "Actif",
    createdBy: "Admin Système",
    updatedBy: "Marie Kalonji",
    createdAt: "01 Jan, 2024",
    updatedAt: "15 Aug, 2024",
  },
  {
    id: "EMP002",
    photo: "/api/placeholder/40/40",
    nom: "Marie-Claire Kasongo Muela",
    sex: "Femme",
    lieuNaissance: "Masisi",
    dateNaissance: "22/07/1990",
    formation: "Master en Criminologie",
    etatCivil: "Célibataire",
    fonction: "Enquêteur Principal",
    lieuDeployment: "Nord-Kivu - Masisi",
    residence: "Masisi Centre",
    telephone: "+243 970 654 321",
    email: "m.kasongo@dsr.gov.cd",
    status: "En transit",
    createdBy: "Jean Muteba",
    updatedBy: "Paul Ilunga",
    createdAt: "15 Feb, 2024",
    updatedAt: "20 Aug, 2024",
  },
  {
    id: "EMP003",
    photo: "/api/placeholder/40/40",
    nom: "Paul Ilunga Kabongo",
    sex: "Homme",
    lieuNaissance: "Rutshuru",
    dateNaissance: "10/11/1982",
    formation: "Diplôme en Sécurité et Défense",
    etatCivil: "Marié(e)",
    fonction: "Agent de Sécurité Senior",
    lieuDeployment: "Nord-Kivu - Rutshuru",
    residence: "Rutshuru Centre",
    telephone: "+243 970 987 654",
    email: "p.ilunga@dsr.gov.cd",
    status: "Actif",
    createdBy: "Sophie Mukendi",
    updatedBy: "Admin Système",
    createdAt: "10 Mar, 2024",
    updatedAt: "25 Aug, 2024",
  },
  {
    id: "EMP004",
    photo: "/api/placeholder/40/40",
    nom: "Agnès Mwenze Kalombo",
    sex: "Femme",
    lieuNaissance: "Goma",
    dateNaissance: "05/09/1988",
    formation: "Licence en Droit",
    etatCivil: "Divorcé(e)",
    fonction: "Conseiller Juridique",
    lieuDeployment: "Nord-Kivu - Goma",
    residence: "Goma - Karisimbi",
    telephone: "+243 970 111 222",
    email: "a.mwenze@dsr.gov.cd",
    status: "Suspendu",
    createdBy: "Gestionnaire RH",
    updatedBy: "Directeur RH",
    createdAt: "20 Jan, 2024",
    updatedAt: "28 Aug, 2024",
  },
  {
    id: "EMP005",
    photo: "/api/placeholder/40/40",
    nom: "David Kabeya Tshilombo",
    sex: "Homme",
    lieuNaissance: "Masisi",
    dateNaissance: "18/12/1987",
    formation: "Master en Technologies de l'Information",
    etatCivil: "Célibataire",
    fonction: "Analyste IT",
    lieuDeployment: "Nord-Kivu - Goma",
    residence: "Goma - Murara",
    telephone: "+243 970 333 444",
    email: "d.kabeya@dsr.gov.cd",
    status: "Actif",
    createdBy: "Gestionnaire IT",
    updatedBy: "Chef Technique",
    createdAt: "05 Apr, 2024",
    updatedAt: "29 Aug, 2024",
  },
];

export default function EmployeesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [columnVisibility, setColumnVisibility] = useState<
    ColumnVisibilityOption[]
  >(employeeColumnConfig.map((col) => ({ ...col, visible: true })));

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

  const handleAddEmployee = (data: EmployeeFormValues) => {
    // This is where you would typically send the data to your backend
    console.log("New employee data:", data);
    // For now, we'll just log it since there's no backend yet
    // You can add logic here to add the employee to your state or call an API
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
          <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
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
            storageKey="employees-columns"
          />
          <EmployeeForm onSubmit={handleAddEmployee} />
        </div>
      </div>
      {/* Table */}
      <EmployeesTable
        employees={employees}
        pagination={paginationConfig}
        visibleColumns={visibleColumnKeys}
      />
    </div>
  );
}
