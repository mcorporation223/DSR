"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  AlertTriangle,
  Users,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/formatters";
import type { Incident } from "./incident-table";

interface IncidentCardProps {
  incident: Incident;
  onView: (incident: Incident) => void;
  onEdit: (incident: Incident) => void;
  onDelete: (incident: Incident) => void;
}

export function IncidentCard({
  incident,
  onView,
  onEdit,
  onDelete,
}: IncidentCardProps) {
  // Get event type display with color coding
  const getEventTypeDisplay = (eventType: string) => {
    switch (eventType) {
      case "Assassinats":
        return {
          text: "Assassinats",
          color: "bg-red-500",
          icon: AlertTriangle,
        };
      case "Fusillades":
        return {
          text: "Fusillades",
          color: "bg-orange-500",
          icon: AlertTriangle,
        };
      default:
        return { text: eventType, color: "bg-gray-500", icon: AlertTriangle };
    }
  };

  const eventTypeInfo = getEventTypeDisplay(incident.eventType);
  const EventIcon = eventTypeInfo.icon;

  // Get victim information for display
  const getVictimInfo = () => {
    if (
      incident.eventType === "Assassinats" &&
      incident.victims &&
      incident.victims.length > 0
    ) {
      const sexes = incident.victims.map((v) => v.sex);
      const uniqueSexes = [...new Set(sexes)];
      const sexDisplay =
        uniqueSexes.length === 1
          ? uniqueSexes[0] === "Male"
            ? "Homme"
            : "Femme"
          : "Mixte";

      const names = incident.victims
        .map((v) => v.name)
        .filter((name) => name.trim() !== "")
        .join(", ");

      const causes = incident.victims
        .map((v) => v.causeOfDeath)
        .filter((cause) => cause && cause.trim() !== "");
      const uniqueCauses = [...new Set(causes)];

      return {
        count: incident.numberOfVictims || incident.victims.length,
        sex: sexDisplay,
        names: names || "Non spécifié",
        causes:
          uniqueCauses.length > 0 ? uniqueCauses.join(", ") : "Non spécifié",
      };
    }
    return null;
  };

  const victimInfo = getVictimInfo();

  return (
    <Card
      className="w-full bg-white hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(incident)}
    >
      <CardContent className="p-4">
        {/* Header with event type and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`p-2 rounded-lg ${eventTypeInfo.color.replace(
                "bg-",
                "bg-"
              )} bg-opacity-10 flex-shrink-0`}
            >
              <EventIcon
                className={`w-5 h-5 ${eventTypeInfo.color.replace(
                  "bg-",
                  "text-"
                )}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg">
                {eventTypeInfo.text}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{formatDate(incident.incidentDate)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex items-center gap-1 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onView(incident);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
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
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    onEdit(incident);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    onDelete(incident);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Location */}
        <div className="mb-3">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">{incident.location}</span>
          </div>
        </div>

        {/* Victim Information (only for Assassinats) */}
        {victimInfo && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Informations sur les victimes
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-red-600" />
                <span className="text-red-800">
                  {victimInfo.count} victime{victimInfo.count > 1 ? "s" : ""} (
                  {victimInfo.sex})
                </span>
              </div>

              <div className="text-red-700">
                <span className="font-medium">Noms:</span>
                <span className="block truncate mt-1">{victimInfo.names}</span>
              </div>

              {victimInfo.causes !== "Non spécifié" && (
                <div className="text-red-700">
                  <span className="font-medium">Cause du décès:</span>
                  <span className="block truncate mt-1">
                    {victimInfo.causes}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer with creation date */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Enregistré le {formatDate(incident.createdAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
