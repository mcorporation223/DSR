"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Seizure } from "./seizure-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getFileUrl } from "@/lib/upload-utils";
import { useState } from "react";
import { Eye } from "lucide-react";
import Image from "next/image";

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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Photo section */}
                <div className="relative group flex-shrink-0">
                  {seizure.photoUrl ? (
                    <div className="relative">
                      <div className="w-20 h-20 rounded-md overflow-hidden border cursor-pointer transition-transform hover:scale-105">
                        <Image
                          src={getFileUrl(seizure.photoUrl)}
                          alt={`Photo de ${seizure.itemName}`}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                          onError={() => {
                            console.warn(
                              "Failed to load seizure photo:",
                              getFileUrl(seizure.photoUrl!)
                            );
                          }}
                          unoptimized={getFileUrl(seizure.photoUrl).startsWith(
                            "/api/files"
                          )}
                        />
                      </div>
                      <div
                        className="absolute inset-0 hover:bg-black hover:opacity-70 group-hover:bg-opacity-30 transition-all duration-200 rounded-md flex items-center justify-center cursor-pointer"
                        onClick={() => setIsImageModalOpen(true)}
                      >
                        <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-400">
                        Aucune photo
                      </span>
                    </div>
                  )}
                </div>

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

                  {seizure.details && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="text-sm font-medium text-gray-500">
                        Détails
                      </label>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {seizure.details}
                      </p>
                    </div>
                  )}

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

      {/* Image Preview Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{seizure.itemName}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <div className="relative max-w-full max-h-[70vh]">
              {seizure.photoUrl ? (
                <Image
                  src={getFileUrl(seizure.photoUrl)}
                  alt={seizure.itemName}
                  width={800}
                  height={600}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  style={{ width: "auto", height: "auto" }}
                  onError={() => {
                    console.error(
                      "Failed to load seizure photo:",
                      getFileUrl(seizure.photoUrl!)
                    );
                  }}
                  unoptimized={getFileUrl(seizure.photoUrl).startsWith(
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
