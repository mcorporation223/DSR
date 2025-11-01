"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Mail,
  Calendar,
  User as UserIcon,
  Key,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { User } from "./user-table";

interface UserCardProps {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export function UserCard({
  user,
  onView,
  onEdit,
  onDelete,
  onResetPassword,
}: UserCardProps) {
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Get role display text
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return { text: "Administrateur", color: "bg-blue-500" };
      case "user":
        return { text: "Utilisateur", color: "bg-green-500" };
      default:
        return { text: role, color: "bg-gray-500" };
    }
  };

  // Get status display text
  const getStatusDisplay = (isActive: boolean, isPasswordSet: boolean) => {
    if (!isPasswordSet && isActive) {
      return { text: "En attente", color: "bg-yellow-500" };
    }
    return isActive
      ? { text: "Actif", color: "bg-green-500" }
      : { text: "Inactif", color: "bg-red-500" };
  };

  const roleInfo = getRoleDisplay(user.role);
  const statusInfo = getStatusDisplay(user.isActive, user.isPasswordSet);

  return (
    <Card
      className="w-full bg-white hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(user)}
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
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg truncate">
                {fullName || "Nom non défini"}
              </h3>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
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
                onView(user);
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    onEdit(user);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    onResetPassword(user);
                  }}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Réinitialiser mot de passe
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    onDelete(user);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status and Role Badges */}
        <div className="mb-3 flex gap-2 flex-wrap">
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
        </div>

        {/* User Information */}
        <div className="space-y-2 text-sm">
          {/* Email */}
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>

          {/* User Icon for role display */}
          <div className="flex items-center gap-2 text-gray-600">
            <UserIcon className="w-4 h-4 flex-shrink-0" />
            <span>{roleInfo.text}</span>
          </div>

          {/* Password status */}
          {!user.isPasswordSet && user.isActive && (
            <div className="flex items-center gap-2 text-amber-600">
              <Key className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Mot de passe non défini</span>
            </div>
          )}
        </div>

        {/* Footer with creation date */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-500">
              Créé le {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
