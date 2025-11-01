"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Trash2,
  FileText,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import type { Statement } from "./statements-table";

interface StatementCardProps {
  statement: Statement;
  onDelete: (statement: Statement) => void;
}

export function StatementCard({ statement, onDelete }: StatementCardProps) {
  const formatDateTime = (date: Date | string) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(statement.fileUrl, "_blank");
  };

  return (
    <Card className="w-full bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header with detainee name and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
              {statement.detaineeName}
            </h3>
            <p className="text-sm text-gray-600">Détenu</p>
          </div>

          {/* Actions */}
          <div
            className="flex items-center gap-1 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
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
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    onDelete(statement);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* File Section */}
        <div className="mb-4">
          <div
            className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
            onClick={handleFileClick}
          >
            <div className="flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">
                Déclaration du détenu
              </p>
              <p className="text-xs text-blue-700">
                Cliquer pour ouvrir le document
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-600 flex-shrink-0" />
          </div>
        </div>

        {/* Creator Information */}
        {statement.createdByName && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">
                Créé par {statement.createdByName}
              </span>
            </div>
          </div>
        )}

        {/* Modifier Information */}
        {statement.updatedByName &&
          statement.updatedByName !== statement.createdByName && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">
                  Modifié par {statement.updatedByName}
                </span>
              </div>
            </div>
          )}

        {/* Footer with dates */}
        <div className="pt-3 border-t border-gray-100 space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-500">
              Créé le {formatDateTime(statement.createdAt)}
            </p>
          </div>
          {statement.updatedAt.getTime() !== statement.createdAt.getTime() && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-500">
                Modifié le {formatDateTime(statement.updatedAt)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
