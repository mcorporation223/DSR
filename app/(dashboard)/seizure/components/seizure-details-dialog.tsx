"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Seizure } from "./seizure-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface SeizureDetailsDialogProps {
  seizure: Seizure | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SeizureDetailsDialog({
  seizure,
  isOpen,
  onClose,
}: SeizureDetailsDialogProps) {
  if (!seizure) {
    return null;
  }

  // Format date for display
  const formatDate = (date: Date | string | null): string => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format datetime for display
  const formatDateTime = (date: Date | string | null): string => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "in_custody":
        return "bg-yellow-500";
      case "released":
        return "bg-green-500";
      case "disposed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "in_custody":
        return "En garde";
      case "released":
        return "Libéré";
      case "disposed":
        return "Disposé";
      default:
        return status || "Non défini";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {seizure.itemName}
                </DialogTitle>
                <p className="flex text-sm text-gray-500 mt-1">
                  Type: {seizure.type}
                </p>
                {seizure.status && (
                  <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max mt-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${getStatusColor(
                        seizure.status
                      )}`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {getStatusLabel(seizure.status)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[60vh] px-2 pb-4">
          <div className="space-y-8">
            {/* Informations générales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Informations générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nom de l&apos;objet
                  </label>
                  <p className="text-sm text-gray-900">
                    {seizure.itemName || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Type
                  </label>
                  <p className="text-sm text-gray-900">
                    {seizure.type || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Lieu de saisie
                  </label>
                  <p className="text-sm text-gray-900">
                    {seizure.seizureLocation || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date de saisie
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(seizure.seizureDate)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Statut
                  </label>
                  <p className="text-sm text-gray-900">
                    {getStatusLabel(seizure.status)}
                  </p>
                </div>

                {seizure.releaseDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Date de restitution
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(seizure.releaseDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Informations véhicule (si applicable) */}
            {(seizure.chassisNumber || seizure.plateNumber) && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Informations véhicule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {seizure.chassisNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Numéro de châssis
                      </label>
                      <p className="text-sm text-gray-900">
                        {seizure.chassisNumber}
                      </p>
                    </div>
                  )}

                  {seizure.plateNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Plaque
                      </label>
                      <p className="text-sm text-gray-900">
                        {seizure.plateNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informations propriétaire */}
            {(seizure.ownerName || seizure.ownerResidence) && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Informations propriétaire
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {seizure.ownerName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Nom
                      </label>
                      <p className="text-sm text-gray-900">
                        {seizure.ownerName}
                      </p>
                    </div>
                  )}

                  {seizure.ownerResidence && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Résidence
                      </label>
                      <p className="text-sm text-gray-900">
                        {seizure.ownerResidence}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informations système */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Informations système
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date d&apos;enregistrement
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(seizure.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dernière modification
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(seizure.updatedAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Créé par
                  </label>
                  <p className="text-sm text-gray-900">
                    {seizure.createdByName || seizure.createdBy || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Modifié par
                  </label>
                  <p className="text-sm text-gray-900">
                    {seizure.updatedByName || seizure.updatedBy || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
