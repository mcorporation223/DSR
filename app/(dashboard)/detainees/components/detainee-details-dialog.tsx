"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFileUrl } from "@/lib/upload-utils";
import type { Detainee } from "./detainee-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Eye } from "lucide-react";
import Image from "next/image";
import { DetaineeStatementsSection } from "./detainee-statements-section";

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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative group">
                <Avatar className="h-16 w-16 cursor-pointer transition-transform hover:scale-105">
                  {detainee.photoUrl ? (
                    <AvatarImage
                      src={getFileUrl(detainee.photoUrl)}
                      alt={`Photo de ${fullName}`}
                      className="object-cover"
                    />
                  ) : null}
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
                </Avatar>
                {detainee.photoUrl && (
                  <div
                    className="absolute inset-0 hover:bg-black hover:opacity-70 group-hover:bg-opacity-30 transition-all duration-200 rounded-full flex items-center justify-center cursor-pointer"
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
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
                      {detainee.sex || "N/A"}
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

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nombre d&apos;enfants
                    </label>
                    <p className="text-sm text-gray-900">
                      {detainee.numberOfChildren || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nom du conjoint
                    </label>
                    <p className="text-sm text-gray-900">
                      {detainee.spouseName || "N/A"}
                    </p>
                  </div>

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

                  {detainee.status === "released" ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Date de libération
                        </label>
                        <p className="text-sm text-gray-900">
                          {formatDate(detainee.releaseDate)}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Raison
                        </label>
                        <p className="text-sm text-gray-900">
                          {detainee.releaseReason || "N/A"}
                        </p>
                      </div>
                    </>
                  ) : detainee.status === "transferred" ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Date de transfert
                        </label>
                        <p className="text-sm text-gray-900">
                          {formatDate(detainee.updatedAt)}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Destination du transfert
                        </label>
                        <p className="text-sm text-gray-900">
                          {detainee.transferDestination || "N/A"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Localisation
                      </label>
                      <p className="text-sm text-gray-900">
                        {detainee.location || "N/A"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Déclarations */}
              <DetaineeStatementsSection
                detaineeId={detainee.id}
                detaineeName={fullName}
              />

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

      {/* Image Preview Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Photo de {fullName}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <div className="relative max-w-full max-h-[70vh]">
              {detainee.photoUrl ? (
                <Image
                  src={getFileUrl(detainee.photoUrl)}
                  alt={fullName}
                  width={800}
                  height={600}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  style={{ width: "auto", height: "auto" }}
                  onError={() => {
                    console.error(
                      "Failed to load detainee photo:",
                      getFileUrl(detainee.photoUrl!)
                    );
                  }}
                  unoptimized={getFileUrl(detainee.photoUrl).startsWith(
                    "/api/files"
                  )}
                />
              ) : (
                <div className="flex items-center justify-center w-[400px] h-[300px] bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Aucune photo disponible</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{fullName}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <div className="relative max-w-full max-h-[70vh]">
              {detainee.photoUrl ? (
                <Image
                  src={getFileUrl(detainee.photoUrl)}
                  alt={fullName}
                  width={800}
                  height={600}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  style={{ width: "auto", height: "auto" }}
                  onError={() => {
                    console.error(
                      "Failed to load detainee photo:",
                      getFileUrl(detainee.photoUrl!)
                    );
                  }}
                  unoptimized={getFileUrl(detainee.photoUrl).startsWith(
                    "/api/files"
                  )}
                />
              ) : (
                <div className="flex items-center justify-center w-[400px] h-[300px] bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Aucune photo disponible</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
