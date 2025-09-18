"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Mail, Calendar } from "lucide-react";
import { User as UserType } from "./user-table";

interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onEdit?: (user: UserType) => void;
}

export function UserDetailsDialog({
  isOpen,
  onClose,
  user,
  onEdit,
}: UserDetailsDialogProps) {
  if (!user) return null;

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A";

  // Get role display info
  const getRoleInfo = (role: string) => {
    switch (role) {
      case "admin":
        return {
          text: "Administrateur",
          color: "bg-blue-500",
        };
      case "user":
        return {
          text: "Utilisateur",
          color: "bg-green-500",
        };
      default:
        return {
          text: role,
          color: "bg-gray-500",
        };
    }
  };

  // Get status display info
  const getStatusInfo = (isActive: boolean) => {
    return isActive
      ? {
          text: "Actif",
          color: "bg-green-500",
        }
      : {
          text: "Inactif",
          color: "bg-red-500",
        };
  };

  const roleInfo = getRoleInfo(user.role);
  const statusInfo = getStatusInfo(user.isActive);

  const handleEdit = () => {
    onEdit?.(user);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            Détails de l&apos;utilisateur
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] overflow-hidden">
          <div className="px-6 space-y-6">
            {/* User Header Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 border px-2 py-1 rounded-md w-max">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${roleInfo.color}`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {roleInfo.text}
                    </span>
                  </div>
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

            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Informations personnelles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                    {user.firstName || "Non spécifié"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Nom de famille
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                    {user.lastName || "Non spécifié"}
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Adresse email
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Historique du compte
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Compte créé
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Edit className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Dernière modification
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(user.updatedAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 px-6 py-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button
            type="button"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Modifier l&apos;utilisateur
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
