"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Incident, Victim } from "./incident-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface IncidentDetailsDialogProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export function IncidentDetailsDialog({
  incident,
  isOpen,
  onClose,
}: IncidentDetailsDialogProps) {
  if (!incident) return null;

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("fr-FR");
  };

  // Get event type display info
  const getEventTypeDisplay = (eventType: string) => {
    switch (eventType) {
      case "Assassinats":
        return { text: "Assassinats", color: "bg-red-500" };
      case "Fusillades":
        return { text: "Fusillades", color: "bg-orange-500" };
      default:
        return { text: eventType, color: "bg-gray-500" };
    }
  };

  const eventTypeInfo = getEventTypeDisplay(incident.eventType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Incident - {incident.eventType}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${eventTypeInfo.color}`}
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {eventTypeInfo.text}
                  </span>
                </div>
                <Badge variant="outline" className="text-gray-600">
                  {formatDate(incident.incidentDate)}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[60vh] overflow-hidden">
          <div className="space-y-8">
            {/* Informations générales de l'incident */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Informations générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Type d&apos;événement
                  </label>
                  <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${eventTypeInfo.color}`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {eventTypeInfo.text}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date de l&apos;incident
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(incident.incidentDate)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Lieu de l&apos;incident
                  </label>
                  <p className="text-sm text-gray-900">
                    {incident.location || "N/A"}
                  </p>
                </div>

                {incident.eventType === "Assassinats" && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nombre de victimes
                    </label>
                    <p className="text-sm text-gray-900">
                      {incident.numberOfVictims || "N/A"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Informations sur les victimes - Uniquement pour les assassinats */}
            {incident.eventType === "Assassinats" &&
              incident.victims &&
              incident.victims.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Informations sur les victimes
                  </h3>
                  <div className="space-y-4">
                    {incident.victims.map((victim: Victim, index: number) => (
                      <div
                        key={victim.id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <h4 className="text-md font-medium text-gray-900 mb-3">
                          Victime {index + 1}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Nom complet
                            </label>
                            <p className="text-sm text-gray-900">
                              {victim.name || "N/A"}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Sexe
                            </label>
                            <p className="text-sm text-gray-900">
                              {victim.sex === "Male"
                                ? "Homme"
                                : victim.sex === "Female"
                                ? "Femme"
                                : "N/A"}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Cause du décès
                            </label>
                            <p className="text-sm text-gray-900">
                              {victim.causeOfDeath || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Informations système */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Informations système
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date d&apos;enregistrement
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(incident.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dernière modification
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(incident.updatedAt)}
                  </p>
                </div>

                {incident.createdByName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Enregistré par
                    </label>
                    <p className="text-sm text-gray-900">
                      {incident.createdByName}
                    </p>
                  </div>
                )}

                {incident.updatedByName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Modifié par
                    </label>
                    <p className="text-sm text-gray-900">
                      {incident.updatedByName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
