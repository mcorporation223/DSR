"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";
import type { Incident } from "./incident-table";
import { formatDate as safeFormatDate } from "@/lib/formatters";

interface IncidentCardProps {
  incident: Incident;
  onEdit: (incident: Incident) => void;
  onDelete: (incident: Incident) => void;
  onView: (incident: Incident) => void;
}

export function IncidentCard({
  incident,
  onEdit,
  onDelete,
  onView,
}: IncidentCardProps) {
  const eventTypeColors = {
    Assassinats: "bg-red-500",
    Fusillades: "bg-orange-500",
  } as const;

  // Using safe formatDate utility function that handles null/undefined dates

  const getVictimInfo = () => {
    if (
      incident.eventType !== "Assassinats" ||
      !incident.victims ||
      incident.victims.length === 0
    ) {
      return null;
    }

    const sexes = incident.victims.map((v) => v.sex);
    const uniqueSexes = [...new Set(sexes)];
    let displaySex = "-";

    if (uniqueSexes.length === 1) {
      displaySex = uniqueSexes[0] === "Male" ? "Homme" : "Femme";
    } else if (uniqueSexes.length > 1) {
      displaySex = "Mixte";
    }

    const names = incident.victims
      .map((v) => v.name)
      .filter((name) => name.trim() !== "")
      .join(", ");

    const causes = incident.victims
      .map((v) => v.causeOfDeath)
      .filter((cause) => cause && cause.trim() !== "");
    const uniqueCauses = [...new Set(causes)];
    const displayCause =
      uniqueCauses.length > 0 ? uniqueCauses.join(", ") : "-";

    return {
      count: incident.numberOfVictims || incident.victims.length,
      sex: displaySex,
      names,
      cause: displayCause,
    };
  };

  const victimInfo = getVictimInfo();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200"
      onClick={() => onView(incident)}
    >
      <CardContent className="p-4">
        {/* Header with Type and Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  eventTypeColors[
                    incident.eventType as keyof typeof eventTypeColors
                  ] || "bg-gray-500"
                }`}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {incident.eventType}
              </span>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onSelect={() => onView(incident)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Voir détails
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEdit(incident)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(incident)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Incident Date */}
        <div className="flex items-center text-gray-600 mb-2">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm font-medium">
            {safeFormatDate(incident.incidentDate)}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-start text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm break-words min-w-0">
            {incident.location}
          </span>
        </div>

        {/* Victim Information (only for Assassinats) */}
        {victimInfo && (
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center text-gray-600 mb-2">
              <Users className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium">
                {victimInfo.count} victime{victimInfo.count > 1 ? "s" : ""} (
                {victimInfo.sex})
              </span>
            </div>

            {victimInfo.names && (
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Noms:
                </span>
                <p className="text-sm text-gray-700 mt-1 break-words">
                  {victimInfo.names}
                </p>
              </div>
            )}

            {victimInfo.cause !== "-" && (
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Cause du décès:
                </span>
                <p className="text-sm text-gray-700 mt-1 break-words">
                  {victimInfo.cause}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer with creation date */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t text-xs text-gray-400">
          <span>Créé le {safeFormatDate(incident.createdAt)}</span>
          {incident.createdByName && <span>par {incident.createdByName}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
