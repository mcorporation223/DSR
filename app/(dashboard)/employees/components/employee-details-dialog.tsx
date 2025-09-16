"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getFileUrl } from "@/lib/upload-utils";
import type { Employee } from "./employees-table";

interface EmployeeDetailsDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeeDetailsDialog({
  employee,
  isOpen,
  onClose,
}: EmployeeDetailsDialogProps) {
  if (!employee) return null;

  const fullName =
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    "Employé sans nom";

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={employee.photoUrl ? getFileUrl(employee.photoUrl) : ""}
                alt={fullName}
              />
              <AvatarFallback className="bg-gray-200 text-lg">
                {fullName
                  ? fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {fullName}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      employee.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {employee.isActive ? (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {employee.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
                {employee.employeeId && (
                  <Badge variant="outline" className="text-gray-600">
                    ID: {employee.employeeId}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Informations personnelles
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Sexe
                </label>
                <p className="text-sm text-gray-900">{employee.sex || "N/A"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Date de naissance
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(employee.dateOfBirth)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Lieu de naissance
                </label>
                <p className="text-sm text-gray-900">
                  {employee.placeOfBirth || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  État civil
                </label>
                <p className="text-sm text-gray-900">
                  {employee.maritalStatus || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Formation
                </label>
                <p className="text-sm text-gray-900">
                  {employee.education || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Informations professionnelles
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fonction
                </label>
                <p className="text-sm text-gray-900">
                  {employee.function || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Lieu de déploiement
                </label>
                <p className="text-sm text-gray-900">
                  {employee.deploymentLocation || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Résidence
                </label>
                <p className="text-sm text-gray-900">
                  {employee.residence || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Contact
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Téléphone
                </label>
                <p className="text-sm text-gray-900">
                  {employee.phone || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-sm text-gray-900">
                  {employee.email || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Informations système */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Informations système
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Date de création
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(employee.createdAt)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Dernière modification
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(employee.updatedAt)}
                </p>
              </div>

              {employee.createdBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Créé par
                  </label>
                  <p className="text-sm text-gray-900">{employee.createdBy}</p>
                </div>
              )}

              {employee.updatedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Modifié par
                  </label>
                  <p className="text-sm text-gray-900">{employee.updatedBy}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
