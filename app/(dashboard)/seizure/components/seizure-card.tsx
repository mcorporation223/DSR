"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Car,
  Bike,
  MapPin,
  User,
  Calendar,
  Hash,
} from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { type Seizure } from "./seizure-table";

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
  // Status badge configuration
  const getStatusConfig = (status: string | null) => {
    const statusValue = status || "in_custody";
    switch (statusValue) {
      case "in_custody":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          dot: "bg-yellow-500",
          text: "En garde",
        };
      case "released":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          dot: "bg-green-500",
          text: "Libéré",
        };
      case "disposed":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          dot: "bg-red-500",
          text: "Disposé",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          dot: "bg-gray-500",
          text: statusValue,
        };
    }
  };

  const statusConfig = getStatusConfig(seizure.status);

  // Type icon configuration
  const getTypeIcon = () => {
    switch (seizure.type) {
      case "vehicule":
        return <Car className="w-4 h-4" />;
      case "objet":
        return <Bike className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (seizure.type) {
      case "vehicule":
        return "Véhicule";
      case "objet":
        return "Objet";
      default:
        return String(seizure.type);
    }
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(seizure)}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header with Type, Status and Actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getTypeIcon()}
              <span className="text-sm font-medium text-gray-700">
                {getTypeLabel()}
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusConfig.color}`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
              ></div>
              {statusConfig.text}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.stopPropagation();
                  onView(seizure);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.stopPropagation();
                  onEdit(seizure);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.stopPropagation();
                  onDelete(seizure);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Item Name */}
        <div>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {seizure.itemName}
          </h3>
        </div>

        {/* Key Information Grid */}
        <div className="space-y-3">
          {/* Seizure Date */}
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">Saisie:</span>
            <span className="font-medium text-gray-900">
              {formatDate(seizure.seizureDate)}
            </span>
          </div>

          {/* Location */}
          {seizure.seizureLocation ? (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Lieu:</span>
              <span className="font-medium text-gray-900 truncate">
                {String(seizure.seizureLocation)}
              </span>
            </div>
          ) : null}

          {/* Owner */}
          {seizure.ownerName ? (
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Propriétaire:</span>
              <span className="font-medium text-gray-900 truncate">
                {String(seizure.ownerName)}
              </span>
            </div>
          ) : null}

          {/* Plate Number */}
          {seizure.plateNumber ? (
            <div className="flex items-center space-x-2 text-sm">
              <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Plaque:</span>
              <span className="font-medium text-gray-900 font-mono">
                {String(seizure.plateNumber)}
              </span>
            </div>
          ) : null}

          {/* Release Date */}
          {seizure.releaseDate ? (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Restitution:</span>
              <span className="font-medium text-gray-900">
                {formatDate(seizure.releaseDate as Date)}
              </span>
            </div>
          ) : null}
        </div>

        {/* Additional Info */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Créé le {formatDate(seizure.createdAt)}</span>
            {seizure.createdByName ? (
              <span>par {String(seizure.createdByName)}</span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
