"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Eye, Calendar, User, Activity, FileText, Clock } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { type AuditLog } from "./audit-logs-table";

interface AuditLogCardProps {
  log: AuditLog;
  onView: (log: AuditLog) => void;
}

export function AuditLogCard({ log, onView }: AuditLogCardProps) {
  // Get action display info
  const getActionDisplay = (action: string) => {
    switch (action) {
      case "create":
        return { text: "Création", color: "bg-green-500" };
      case "update":
        return { text: "Modification", color: "bg-blue-500" };
      case "delete":
        return { text: "Suppression", color: "bg-red-500" };
      case "status_change":
        return { text: "Changement statut", color: "bg-orange-500" };
      default:
        return { text: action, color: "bg-gray-500" };
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
  const fullName = `${log.userFirstName || ""} ${
    log.userLastName || ""
  }`.trim();
  const details = log.details as Record<string, unknown> | undefined;
  const description = (details?.description as string) || "Aucune description";

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(log)}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header with Action, Entity Type and View Button */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <StatusBadge
              text={actionInfo.text}
              circleColor={actionInfo.color}
              icon={<div className="w-2 h-2 bg-white rounded-full"></div>}
            />
            <StatusBadge
              text={entityInfo.text}
              circleColor={entityInfo.color}
              icon={<div className="w-2 h-2 bg-white rounded-full"></div>}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onView(log);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* Date and Time */}
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600">Date:</span>
          <span className="font-medium text-gray-900">
            {formatDate(log.createdAt)}
          </span>
          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
          <span className="font-medium text-gray-900">
            {new Date(log.createdAt).toLocaleTimeString("fr-FR")}
          </span>
        </div>

        {/* User Information */}
        {fullName && (
          <div className="flex items-start space-x-2 text-sm">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-gray-600">Utilisateur:</span>
              <span className="font-medium text-gray-900 truncate">
                {fullName}
              </span>
              {log.userEmail && (
                <span className="text-xs text-gray-500 truncate">
                  {log.userEmail}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Entity ID */}
        <div className="flex items-center space-x-2 text-sm">
          <Activity className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600">ID Entité:</span>
          <span className="font-medium text-gray-900 font-mono">
            {log.entityId.substring(0, 8)}...
          </span>
        </div>

        {/* Details */}
        {details && (
          <div className="flex items-start space-x-2 text-sm">
            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-gray-600">Détails:</span>
              <span className="text-gray-900 text-sm leading-relaxed">
                {description}
              </span>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Journal #{log.id}</span>
            {log.userRole && <span className="capitalize">{log.userRole}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
