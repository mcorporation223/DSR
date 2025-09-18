"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, User, FileText, Info, Clock, Tag } from "lucide-react";
import type { AuditLog } from "./audit-logs-table";

interface AuditLogDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

export function AuditLogDetailsDialog({
  isOpen,
  onClose,
  log,
}: AuditLogDetailsDialogProps) {
  if (!log) return null;

  // Get action display info
  const getActionDisplay = (action: string) => {
    switch (action) {
      case "create":
        return {
          text: "Création",
          color: "bg-green-500",
          textColor: "text-green-700",
          bgColor: "bg-green-50",
        };
      case "update":
        return {
          text: "Modification",
          color: "bg-blue-500",
          textColor: "text-blue-700",
          bgColor: "bg-blue-50",
        };
      case "delete":
        return {
          text: "Suppression",
          color: "bg-red-500",
          textColor: "text-red-700",
          bgColor: "bg-red-50",
        };
      case "status_change":
        return {
          text: "Changement statut",
          color: "bg-orange-500",
          textColor: "text-orange-700",
          bgColor: "bg-orange-50",
        };
      default:
        return {
          text: action,
          color: "bg-gray-500",
          textColor: "text-gray-700",
          bgColor: "bg-gray-50",
        };
    }
  };

  // Get entity type display info
  const getEntityTypeDisplay = (entityType: string) => {
    switch (entityType) {
      case "employee":
        return { text: "Employé", color: "bg-blue-500" };
      case "detainee":
        return { text: "Détenu", color: "bg-red-500" };
      case "report":
        return { text: "Rapport", color: "bg-green-500" };
      case "statement":
        return { text: "Déclaration", color: "bg-purple-500" };
      case "incident":
        return { text: "Incident", color: "bg-orange-500" };
      case "seizure":
        return { text: "Saisie", color: "bg-yellow-500" };
      case "user":
        return { text: "Utilisateur", color: "bg-indigo-500" };
      default:
        return { text: entityType, color: "bg-gray-500" };
    }
  };

  const actionInfo = getActionDisplay(log.action);
  const entityInfo = getEntityTypeDisplay(log.entityType);
  const details = log.details as Record<
    string,
    string | number | boolean | null
  > | null;
  const fullName = `${log.userFirstName || ""} ${
    log.userLastName || ""
  }`.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            Détails du journal d&apos;audit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className={`p-4 rounded-lg ${actionInfo.bgColor} border`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border px-3 py-1.5 rounded-md bg-white">
                  <div className={`w-3 h-3 rounded-full ${actionInfo.color}`} />
                  <span className="text-sm font-medium text-gray-900">
                    {actionInfo.text}
                  </span>
                </div>
                <div className="flex items-center gap-2 border px-3 py-1.5 rounded-md bg-white">
                  <div className={`w-3 h-3 rounded-full ${entityInfo.color}`} />
                  <span className="text-sm font-medium text-gray-900">
                    {entityInfo.text}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {new Date(log.createdAt).toLocaleString("fr-FR")}
              </div>
            </div>

            {details?.description && (
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className={`text-sm font-medium ${actionInfo.textColor}`}>
                  {details.description}
                </p>
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <User className="w-4 h-4" />
                Utilisateur
              </h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">
                    {fullName || "N/A"}
                  </div>
                  <div className="text-xs text-gray-600">{log.userEmail}</div>
                  <div className="text-xs text-gray-500">
                    Rôle: {log.userRole || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Entité
              </h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">
                    {entityInfo.text}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    ID: {log.entityId}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Changes Information */}
          {details?.changed && Object.keys(details.changed).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Modifications apportées
              </h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="space-y-3">
                  {Object.entries(details.changed).map(
                    ([field, change]: [
                      string,
                      {
                        old: string | number | null;
                        new: string | number | null;
                      }
                    ]) => (
                      <div
                        key={field}
                        className="border-l-2 border-blue-200 pl-3"
                      >
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {field.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </div>
                        <div className="mt-1 space-y-1">
                          <div className="text-xs">
                            <span className="text-red-600 font-medium">
                              Ancien:
                            </span>{" "}
                            <span className="bg-red-50 px-2 py-1 rounded text-red-800">
                              {change.old || "N/A"}
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="text-green-600 font-medium">
                              Nouveau:
                            </span>{" "}
                            <span className="bg-green-50 px-2 py-1 rounded text-green-800">
                              {change.new || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Additional Details */}
          {details && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Informations supplémentaires
              </h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(details)
                    .filter(
                      ([key]) => !["description", "changed"].includes(key)
                    )
                    .map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
                        </span>{" "}
                        <span className="text-gray-900">
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Timestamp Details */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-4 h-4" />
              <span>
                Journal créé le{" "}
                {new Date(log.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
