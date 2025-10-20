"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Trash2,
  FileText,
  User,
  Calendar,
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
  // Format date for display
  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFileOpen = () => {
    window.open(statement.fileUrl, "_blank");
  };

  return (
    <Card className="w-full bg-white hover:shadow-md transition-shadow border border-gray-200">
      <CardContent className="p-4">
        {/* Header with detainee name and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <h3
                className="text-lg font-semibold text-gray-900 truncate"
                title={statement.detaineeName}
              >
                {statement.detaineeName}
              </h3>
            </div>
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(statement)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* File Link */}
        <div className="mb-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-auto py-3 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={handleFileOpen}
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="font-medium">Déclaration</div>
              <div className="text-xs text-blue-500">Cliquer pour ouvrir</div>
            </div>
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
          </Button>
        </div>

        {/* Creator Info */}
        <div className="space-y-2 mb-3">
          {statement.createdByName && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">
                Créé par {statement.createdByName}
              </span>
            </div>
          )}
          {statement.updatedByName &&
            statement.updatedByName !== statement.createdByName && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">
                  Modifié par {statement.updatedByName}
                </span>
              </div>
            )}
        </div>

        {/* Footer with creation date */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>
              Créé le {formatDateTime(statement.createdAt)}
              {statement.updatedAt &&
                statement.updatedAt > statement.createdAt && (
                  <span>
                    {" "}
                    • Modifié le {formatDateTime(statement.updatedAt)}
                  </span>
                )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
