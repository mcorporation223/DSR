"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Briefcase,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { EmployeeStatusBadge } from "@/components/status-badge";
import { getFileUrl } from "@/lib/upload-utils";
import { EditEmployeeForm } from "./edit-employee-form";
import type { Employee } from "./employees-table";

interface EmployeeCardProps {
  employee: Employee;
  onView: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onEmployeeSuccess: () => void;
}

export function EmployeeCard({
  employee,
  onView,
  onDelete,
  onEmployeeSuccess,
}: EmployeeCardProps) {
  const fullName = `${employee.firstName || ""} ${
    employee.lastName || ""
  }`.trim();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <Card
      className="w-full bg-white hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(employee)}
    >
      <CardContent className="p-4">
        {/* Header with photo, name, and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage
                src={employee.photoUrl ? getFileUrl(employee.photoUrl) : ""}
                alt={fullName || "User"}
              />
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
                {fullName || "N/A"}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {employee.function || "N/A"}
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
                onView(employee);
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
                <EditEmployeeForm
                  employee={employee}
                  onSuccess={onEmployeeSuccess}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                </EditEmployeeForm>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    onDelete(employee);
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
          <EmployeeStatusBadge isActive={employee.isActive} />
        </div>

        {/* Key Information Grid */}
        <div className="space-y-2 text-sm">
          {/* Location and Sex */}
          <div className="grid grid-cols-2 gap-4">
            {employee.deploymentLocation && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{employee.deploymentLocation}</span>
              </div>
            )}
            {employee.sex && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 flex-shrink-0" />
                <span>{employee.sex}</span>
              </div>
            )}
          </div>

          {/* Contact Information */}
          {(employee.phone || employee.email) && (
            <div className="space-y-1">
              {employee.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{employee.phone}</span>
                </div>
              )}
              {employee.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
              )}
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 gap-1">
            {employee.dateOfBirth && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>Né(e) le {formatDate(employee.dateOfBirth)}</span>
              </div>
            )}
            {employee.education && (
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{employee.education}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer with creation date */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Créé le {formatDate(employee.createdAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
