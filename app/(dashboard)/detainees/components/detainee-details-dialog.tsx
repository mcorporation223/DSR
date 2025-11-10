"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Detainee } from "./detainee-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DetaineeDetailsDialogProps {
  detainee: Detainee | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DetaineeDetailsDialog({
  detainee,
  isOpen,
  onClose,
}: DetaineeDetailsDialogProps) {
  if (!detainee) return null;

  const fullName =
    `${detainee.firstName || ""} ${detainee.lastName || ""}`.trim() ||
    "Détenu sans nom";

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("fr-FR");
  };

  const formatTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return "N/A";
    return new Date(dateTimeString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Get status display info
  const getStatusDisplay = (status: string | null) => {
    switch (status) {
      case "in_custody":
        return { text: "En détention", color: "bg-red-500" };
      case "released":
        return { text: "Libéré", color: "bg-green-500" };
      case "transferred":
        return { text: "Transféré", color: "bg-blue-500" };
      default:
        return { text: "Inconnu", color: "bg-gray-500" };
    }
  };

  const statusInfo = getStatusDisplay(detainee.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            {/* <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gray-200 text-lg">
                {fullName
                  ? fullName
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "D"}
              </AvatarFallback>
            </Avatar> */}
            <div className="flex-1">
              <DialogTitle className="text-xl flex font-semibold text-gray-900">
                {fullName}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${statusInfo.color}`}
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {statusInfo.text}
                  </span>
                </div>
                {detainee.cellNumber && (
                  <Badge variant="outline" className="text-gray-600">
                    Cellule: {detainee.cellNumber}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[60vh] px-2 pb-4 overflow-hidden">
          <div className="space-y-8">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Sexe
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.sex === "Male"
                      ? "Homme"
                      : detainee.sex === "Female"
                      ? "Femme"
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date de naissance
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(detainee.dateOfBirth)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Lieu de naissance
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.placeOfBirth || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Noms des parents
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.parentNames || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Quartier d&apos;origine
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.originNeighborhood || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    État civil
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.maritalStatus || "N/A"}
                  </p>
                </div>

                {detainee.maritalDetails && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Détails état civil
                    </label>
                    <p className="text-sm text-gray-900">
                      {detainee.maritalDetails}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Religion
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.religion || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations socio-professionnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Informations socio-professionnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Niveau d&apos;études
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.education || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Emploi/Profession
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.employment || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Résidence
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.residence || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Téléphone
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.phoneNumber || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations d'arrestation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Informations d&apos;arrestation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Motif d&apos;arrestation
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.crimeReason || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date d&apos;arrestation
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(detainee.arrestDate)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Lieu d&apos;arrestation
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.arrestLocation || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Arrêté par
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.arrestedBy || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Heure d&apos;arrestation
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatTime(detainee.arrestTime)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Heure d&apos;arrivée
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatTime(detainee.arrivalTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations de détention */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Informations de détention
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Statut actuel
                  </label>
                  <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${statusInfo.color}`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {statusInfo.text}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Numéro de cellule
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.cellNumber || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Localisation
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.location || "N/A"}
                  </p>
                </div>

                {detainee.releaseDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Date de libération
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(detainee.releaseDate)}
                    </p>
                  </div>
                )}

                {detainee.releaseReason && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Motif de libération
                    </label>
                    <p className="text-sm text-gray-900">
                      {detainee.releaseReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

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
                    {formatDateTime(detainee.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dernière modification
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(detainee.updatedAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Créé par
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.createdByName || detainee.createdBy || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Modifié par
                  </label>
                  <p className="text-sm text-gray-900">
                    {detainee.updatedByName || detainee.updatedBy || "N/A"}
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
