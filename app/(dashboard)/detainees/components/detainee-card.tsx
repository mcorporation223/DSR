"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  User,
  Phone,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Detainee } from "./detainee-table";

interface DetaineeCardProps {
  detainee: Detainee;
  onView: (detainee: Detainee) => void;
  onEdit: (detainee: Detainee) => void;
  onDelete: (detainee: Detainee) => void;
}

export function DetaineeCard({
  detainee,
  onView,
  onEdit,
  onDelete,
}: DetaineeCardProps) {
  const fullName = `${detainee.firstName || ""} ${
    detainee.lastName || ""
  }`.trim();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Get status display text
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
    <Card
      className="w-full bg-white hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(detainee)}
    >
      <CardContent className="p-4">
        {/* Header with avatar, name, and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarFallback className="bg-gray-200 text-gray-600">
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
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg truncate">
                {fullName || "Nom non défini"}
              </h3>
              <p className="text-sm text-gray-600">
                {detainee.sex === "Male"
                  ? "Homme"
                  : detainee.sex === "Female"
                  ? "Femme"
                  : "N/A"}
                {(detainee.cellNumber as string) &&
                  ` • Cellule ${detainee.cellNumber as string}`}
              </p>
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
                onView(detainee);
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
                    onEdit(detainee);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    onDelete(detainee);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status Badge */}
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

        {/* Key Information */}
        <div className="space-y-2 text-sm">
          {/* Crime Reason */}
          {detainee.crimeReason && (
            <div className="flex items-start gap-2 text-gray-600">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{detainee.crimeReason}</span>
            </div>
          )}

          {/* Location Information */}
          <div className="grid grid-cols-1 gap-1">
            {detainee.residence && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{detainee.residence}</span>
              </div>
            )}
            {detainee.arrestLocation && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">
                  Arrêté à {detainee.arrestLocation}
                </span>
              </div>
            )}
          </div>

          {/* Contact and Personal Info */}
          <div className="grid grid-cols-1 gap-1">
            {detainee.phoneNumber && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{detainee.phoneNumber}</span>
              </div>
            )}
            {detainee.dateOfBirth && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>Né(e) le {formatDate(detainee.dateOfBirth)}</span>
              </div>
            )}
            {detainee.employment && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{detainee.employment}</span>
              </div>
            )}
          </div>

          {/* Arrest Date */}
          {detainee.arrestDate && (
            <div className="flex items-center gap-2 text-amber-600">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">
                Arrêté le {formatDate(detainee.arrestDate)}
              </span>
            </div>
          )}
        </div>

        {/* Footer with creation date */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Enregistré le {formatDate(detainee.createdAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
