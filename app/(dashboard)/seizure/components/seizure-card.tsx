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
  Download,
  MapPin,
  Calendar,
  User,
  Car,
} from "lucide-react";
import type { Seizure } from "./seizure-table";

interface SeizureCardProps {
  seizure: Seizure;
  onEdit: (seizure: Seizure) => void;
  onDelete: (seizure: Seizure) => void;
  onView: (seizure: Seizure) => void;
}

export function SeizureCard({
  seizure,
  onEdit,
  onDelete,
  onView,
}: SeizureCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const getStatusDisplay = (status: string | null) => {
    const statusValue = status || "in_custody";
    switch (statusValue) {
      case "in_custody":
        return { text: "En garde", color: "bg-yellow-500" };
      case "released":
        return { text: "Libéré", color: "bg-green-500" };
      case "disposed":
        return { text: "Disposé", color: "bg-red-500" };
      default:
        return { text: statusValue, color: "bg-gray-500" };
    }
  };

  const statusInfo = getStatusDisplay(seizure.status);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200"
      onClick={() => onView(seizure)}
    >
      <CardContent className="p-4">
        {/* Header with Type and Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">
              {seizure.type}
            </span>
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
                <DropdownMenuItem onSelect={() => onView(seizure)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Voir détails
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {}}>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEdit(seizure)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(seizure)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Item Name/Description */}
        <div className="mb-3">
          <h3 className="text-base font-medium text-gray-900 break-words">
            {seizure.itemName}
          </h3>
        </div>

        {/* Status */}
        <div className="mb-3">
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

        {/* Seizure Date */}
        <div className="flex items-center text-gray-600 mb-2">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm">
            Saisi le {formatDate(seizure.seizureDate)}
          </span>
        </div>

        {/* Seizure Location */}
        {seizure.seizureLocation && (
          <div className="flex items-start text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm break-words min-w-0">
              {seizure.seizureLocation}
            </span>
          </div>
        )}

        {/* Owner Information */}
        {seizure.ownerName && (
          <div className="flex items-start text-gray-600 mb-2">
            <User className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-sm break-words">{seizure.ownerName}</span>
              {seizure.ownerResidence && (
                <p className="text-xs text-gray-500 mt-1">
                  {seizure.ownerResidence}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Vehicle Details */}
        <div className="border-t pt-3 mt-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {seizure.plateNumber && (
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Plaque:
                </span>
                <p className="text-gray-700 font-mono mt-1">
                  {seizure.plateNumber}
                </p>
              </div>
            )}

            {seizure.chassisNumber && (
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Châssis:
                </span>
                <p className="text-gray-700 font-mono mt-1 break-all">
                  {seizure.chassisNumber}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Release Date */}
        {seizure.releaseDate && (
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">
                Restitué le {formatDate(seizure.releaseDate)}
              </span>
            </div>
          </div>
        )}

        {/* Footer with creation date */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t text-xs text-gray-400">
          <span>Créé le {formatDate(seizure.createdAt)}</span>
          {seizure.createdByName && <span>par {seizure.createdByName}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
