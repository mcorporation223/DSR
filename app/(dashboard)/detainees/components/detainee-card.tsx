"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  User,
  Calendar,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  Download,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  // Format date for display
  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  // Get full name
  const fullName = `${detainee.firstName || ""} ${
    detainee.lastName || ""
  }`.trim();

  // Get status display
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
      className="w-full bg-white hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
      onClick={() => onView(detainee)}
    >
      <CardContent className="p-4">
        {/* Header with name and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-semibold text-gray-900 truncate"
              title={fullName}
            >
              {fullName || "N/A"}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600">
                {detainee.sex === "Male"
                  ? "Homme"
                  : detainee.sex === "Female"
                  ? "Femme"
                  : "N/A"}
              </span>
              {detainee.cellNumber && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    Cellule {detainee.cellNumber}
                  </span>
                </>
              )}
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
              onClick={() => onView(detainee)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Download className="w-4 h-4" />
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
                <DropdownMenuItem onSelect={() => onEdit(detainee)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(detainee)}
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

        {/* Key Information Grid */}
        <div className="space-y-3 mb-3">
          {/* Crime Reason */}
          {detainee.crimeReason && (
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Motif d&apos;arrestation
                </span>
                <p className="text-sm text-gray-900 break-words">
                  {detainee.crimeReason}
                </p>
              </div>
            </div>
          )}

          {/* Arrest Info */}
          {detainee.arrestDate && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">
                Arrêté le {formatDate(detainee.arrestDate)}
                {detainee.arrestLocation && ` à ${detainee.arrestLocation}`}
              </span>
            </div>
          )}

          {/* Personal Info */}
          <div className="grid grid-cols-1 gap-2">
            {detainee.dateOfBirth && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">
                  Né(e) le {formatDate(detainee.dateOfBirth)}
                </span>
                {detainee.placeOfBirth && (
                  <span className="text-sm">à {detainee.placeOfBirth}</span>
                )}
              </div>
            )}

            {detainee.residence && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{detainee.residence}</span>
              </div>
            )}

            {detainee.phoneNumber && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{detainee.phoneNumber}</span>
              </div>
            )}
          </div>

          {/* Education and Employment */}
          <div className="grid grid-cols-1 gap-2">
            {detainee.education && (
              <div className="flex items-center gap-2 text-gray-600">
                <GraduationCap className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{detainee.education}</span>
              </div>
            )}
            {detainee.employment && (
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{detainee.employment}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer with creation date */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Enregistré le {formatDate(detainee.createdAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
