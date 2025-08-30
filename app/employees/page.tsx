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

// Dummy data for employees
const employees: Employee[] = [
  {
    id: "EMP001",
    photo: "/api/placeholder/40/40",
    nom: "Jean Baptiste Uwimana",
    sex: "Homme",
    lieuNaissance: "Kigali",
    dateNaissance: "15/03/1985",
    formation: "Licence en Administration",
    etatCivil: "Marié(e)",
    fonction: "Chef de Service",
    lieuDeployment: "Kigali Central",
    residence: "Nyarutarama",
    telephone: "+250 788 123 456",
    email: "j.uwimana@dsr.gov.rw",
    status: "Actif",
    createdBy: "Admin System",
    updatedBy: "Marie Dupont",
    createdAt: "01 Jan, 2024",
    updatedAt: "15 Aug, 2024",
  },
  {
    id: "EMP002",
    photo: "/api/placeholder/40/40",
    nom: "Marie Claire Mukamana",
    sex: "Femme",
    lieuNaissance: "Huye",
    dateNaissance: "22/07/1990",
    formation: "Master en Criminologie",
    etatCivil: "Célibataire",
    fonction: "Enquêteur Principal",
    lieuDeployment: "Huye District",
    residence: "Butare",
    telephone: "+250 788 654 321",
    email: "m.mukamana@dsr.gov.rw",
    status: "En transit",
    createdBy: "Jean Martin",
    updatedBy: "Paul Nkurunziza",
    createdAt: "15 Feb, 2024",
    updatedAt: "20 Aug, 2024",
  },
  {
    id: "EMP003",
    photo: "/api/placeholder/40/40",
    nom: "Paul Nkurunziza",
    sex: "Homme",
    lieuNaissance: "Rubavu",
    dateNaissance: "10/11/1982",
    formation: "Diplôme en Sécurité",
    etatCivil: "Marié(e)",
    fonction: "Agent de Sécurité Senior",
    lieuDeployment: "Rubavu District",
    residence: "Gisenyi",
    telephone: "+250 788 987 654",
    email: "p.nkurunziza@dsr.gov.rw",
    status: "Actif",
    createdBy: "Sophie Laurent",
    updatedBy: "Admin System",
    createdAt: "10 Mar, 2024",
    updatedAt: "25 Aug, 2024",
  },
  {
    id: "EMP004",
    photo: "/api/placeholder/40/40",
    nom: "Agnes Uwimana",
    sex: "Femme",
    lieuNaissance: "Musanze",
    dateNaissance: "05/09/1988",
    formation: "Licence en Droit",
    etatCivil: "Divorcé(e)",
    fonction: "Conseiller Juridique",
    lieuDeployment: "Musanze District",
    residence: "Ruhengeri",
    telephone: "+250 788 111 222",
    email: "a.uwimana@dsr.gov.rw",
    status: "Suspendu",
    createdBy: "HR Manager",
    updatedBy: "Directeur RH",
    createdAt: "20 Jan, 2024",
    updatedAt: "28 Aug, 2024",
  },
  {
    id: "EMP005",
    photo: "/api/placeholder/40/40",
    nom: "David Habimana",
    sex: "Homme",
    lieuNaissance: "Kayonza",
    dateNaissance: "18/12/1987",
    formation: "Master en Technologies",
    etatCivil: "Célibataire",
    fonction: "Analyste IT",
    lieuDeployment: "Kigali Central",
    residence: "Kimisagara",
    telephone: "+250 788 333 444",
    email: "d.habimana@dsr.gov.rw",
    status: "Actif",
    createdBy: "IT Manager",
    updatedBy: "Tech Lead",
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
